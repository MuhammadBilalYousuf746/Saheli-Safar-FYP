import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import User from "../auth/user.model.js";
import PassengerProfile from "../passenger/passenger.model.js";
import { VerificationReview, VerificationOperation, VERIFICATION_STATUSES } from "./verification.model.js";
import { createVerificationStorage, ASSET_PREFIX } from "./verification-storage.js";
import { validateVerificationImages } from "./verification-images.js";
import { createError } from "../../utils/app-error.js";

const unavailable = () => createError("Verification service is temporarily unavailable. Please retry.", 503);
const conflict = () => createError("Verification details changed. Refresh before trying again.", 409);
const missing = () => createError("Verification record not available.", 404);
const versionFilter = revision => revision === 0 ? { $or: [{ verificationRevision: 0 }, { verificationRevision: { $exists: false } }] } : { verificationRevision: revision };
const submissionSchema = z.object({ revision: z.string().regex(/^(0|[1-9][0-9]{0,8})$/).transform(Number) }).strict();
const decisionSchema = z.object({ revision: z.number().int().min(0), submissionId: z.string().uuid(), decision: z.enum(["approved", "rejected", "reverification_requested"]), reason: z.string().trim().min(2).max(500).optional() }).strict().superRefine((data, ctx) => {
  if (data.decision !== "approved" && !data.reason) ctx.addIssue({ code: "custom", path: ["reason"], message: "A reason is required." });
});

export function createMongooseVerificationRepo() {
  return {
    async owned(id) {
      const user = await User.findOne({ _id: id, role: "passenger", status: "active", isEmailVerified: true }).select("_id fullName email");
      const profile = user && await PassengerProfile.findOne({ user: id }).select("+verificationAssets");
      if (!profile) throw missing();
      return { profile, user };
    },
    async swap(id, revision, fields, statuses) {
      return PassengerProfile.findOneAndUpdate({ user: id, documentsDeletedAt: null, $and: [versionFilter(revision), { $or: [{ verificationStatus: { $in: statuses } }, { verificationStatus: { $exists: false } }] }] },
        { $set: fields, $inc: { verificationRevision: 1 } }, { returnDocument: "after", runValidators: true, maxTimeMS: 10000, writeConcern: { w: "majority", wtimeout: 10000 } }).select("+verificationAssets");
    },
    bySubmission: (id, submissionId) => PassengerProfile.findOne({ user: id, submissionId }).select("+verificationAssets").read("primary").readConcern("majority"),
    createOperation: operation => VerificationOperation.create([operation], { writeConcern: { w: "majority", wtimeout: 10000 } }),
    getOperation: id => VerificationOperation.findById(id),
    setOperation: (id, state) => VerificationOperation.updateOne({ _id: id }, { $set: { state } }),
    references: assets => PassengerProfile.exists({ "verificationAssets.publicId": { $in: assets.map(asset => asset.publicId) } }).read("primary").readConcern("majority"),
    history: id => VerificationReview.find({ passenger: id }).sort({ revision: -1 }).limit(50).lean(),
    async queue(page) {
      const filter = { verificationStatus: "pending_review", documentsDeletedAt: null };
      const profiles = await PassengerProfile.find(filter).sort({ submittedAt: 1, _id: 1 }).skip((page - 1) * 20).limit(20).populate({ path: "user", select: "fullName email role status" }).lean();
      return { submissions: profiles.filter(p => p.user?.role === "passenger" && p.user.status === "active").map(p => ({ userId: String(p.user._id), fullName: p.user.fullName, email: p.user.email, submittedAt: p.submittedAt })), page, hasMore: profiles.length === 20 };
    },
    async review(id, actor, data) {
      await VerificationReview.init();
      return mongoose.connection.transaction(async session => {
        const admin = await User.findOne({ _id: actor, role: "admin", status: "active", permissions: { $all: ["manageAdmins", "verifyPassengers"] } }).session(session);
        if (!admin) throw createError("Only Full Access Admins explicitly granted verifyPassengers may perform Passenger identity verification.", 403);
        const passenger = await User.findOne({ _id: id, role: "passenger", status: "active", isEmailVerified: true }).session(session);
        if (!passenger) throw missing();
        const allowed = data.decision === "reverification_requested" ? ["approved", "rejected"] : ["pending_review"];
        const status = data.decision === "reverification_requested" ? "not_submitted" : data.decision;
        const now = new Date();
        const profile = await PassengerProfile.findOneAndUpdate({ user: id, submissionId: data.submissionId, verificationRevision: data.revision, verificationStatus: { $in: allowed }, documentsDeletedAt: null },
          { $set: { verificationStatus: status, reviewedBy: actor, reviewedAt: now, rejectionReason: status === "rejected" ? data.reason : null, reverificationReason: data.decision === "reverification_requested" ? data.reason : null }, $inc: { verificationRevision: 1 } },
          { session, returnDocument: "after", runValidators: true }).select("+verificationAssets");
        if (!profile) throw conflict();
        await VerificationReview.create([{ passenger: id, admin: actor, submissionId: data.submissionId, revision: profile.verificationRevision, decision: data.decision, reason: data.reason || null, decidedAt: now }], { session });
        return profile;
      }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" }, readPreference: "primary", maxCommitTimeMS: 10000 });
    },
    async retire(id) {
      return PassengerProfile.findOneAndUpdate({ user: id }, { $set: { verificationAssets: [], documentsDeletedAt: new Date() }, $inc: { verificationRevision: 1 } }, { returnDocument: "before", maxTimeMS: 10000, writeConcern: { w: "majority", wtimeout: 10000 } }).select("+verificationAssets");
    },
    operationsFor: id => VerificationOperation.find({ passenger: id, state: { $ne: "cleaned" } }),
    staleOperations: before => VerificationOperation.find({ state: { $ne: "cleaned" }, updatedAt: { $lt: before } }).limit(100),
  };
}

export function createVerificationService({ repo = createMongooseVerificationRepo(), storage = createVerificationStorage(), validateImages = validateVerificationImages, log = data => console.warn("Verification cleanup requires attention", data) } = {}) {
  const note = operationId => log({ operationId, code: "verification_reconcile_needed" });
  const setOperation = async (id, state) => { try { await repo.setOperation(id, state); } catch { note(id); } };
  const dto = profile => {
    const status = profile.verificationStatus || "not_submitted";
    if (!VERIFICATION_STATUSES.includes(status)) throw unavailable();
    let cnic = 0;
    return { status, revision: profile.verificationRevision || 0, submissionId: profile.submissionId || null,
      submittedAt: profile.submittedAt || null, reviewedAt: profile.reviewedAt || null,
      rejectionReason: status === "rejected" ? profile.rejectionReason : null,
      reverificationReason: profile.reverificationReason || null,
      submissionAvailable: storage.available() && !profile.documentsDeletedAt,
      documentsDeleted: Boolean(profile.documentsDeletedAt),
      documents: (profile.verificationAssets || []).map(asset => ({ key: asset.kind === "cnic" ? `cnic-${cnic++}` : "selfie", kind: asset.kind })),
    };
  };
  const cleanup = async (operation, final = false) => {
    if (!operation) return;
    try {
      if (await repo.references(operation.assets)) { await setOperation(operation._id, "committed"); return; }
      await setOperation(operation._id, "cleanup_pending");
      for (const asset of operation.assets) await storage.remove(asset);
      // Retry after a one-hour grace even after a successful immediate delete:
      // a timed-out Cloudinary upload can finish after the first delete request.
      await setOperation(operation._id, final ? "cleaned" : "cleanup_pending");
    } catch { await setOperation(operation._id, "cleanup_pending"); note(operation._id); }
  };
  const service = {
    async mine(id) { return dto((await repo.owned(id)).profile); },
    async submit(id, body, files) {
      const { revision } = submissionSchema.parse(body);
      const { profile } = await repo.owned(id);
      const status = profile.verificationStatus || "not_submitted";
      if (profile.documentsDeletedAt || !["not_submitted", "rejected"].includes(status) || (profile.verificationRevision || 0) !== revision) throw conflict();
      const images = await validateImages(files);
      let operation;
      try {
        storage.assertAvailable();
        const operationId = randomUUID();
        operation = { _id: operationId, passenger: id, state: "uploading", assets: images.map(image => ({ kind: image.kind, publicId: `${ASSET_PREFIX}${operationId}/${image.kind}-${randomUUID()}`, format: "jpg", deliveryType: "authenticated", resourceType: "image" })) };
        await repo.createOperation(operation);
        try { for (let index = 0; index < images.length; index++) await storage.upload(operation.assets[index], images[index].buffer); }
        catch (error) { await cleanup(operation); throw error; }
        let saved;
        try {
          // Legacy rows may lack the status field; hydration gives not_submitted,
          // but the Mongo predicate must explicitly admit that absence too.
          saved = await repo.swap(id, revision, { verificationStatus: "pending_review", submissionId: operationId,
            verificationAssets: operation.assets, submittedAt: new Date(), rejectionReason: null, reverificationReason: null, reviewedBy: null, reviewedAt: null }, ["not_submitted", "rejected"]);
        } catch (error) {
          try { saved = await repo.bySubmission(id, operationId); }
          catch { await setOperation(operationId, "uncertain"); note(operationId); throw createError("Submission result could not be confirmed. Refresh verification status before retrying.", 503); }
          if (!saved) {
            // A lost acknowledgement can precede a late server commit. Never
            // delete potentially referenced assets on an ambiguous write error.
            if (error.name === "ValidationError" || [11000, 121].includes(error.code)) await cleanup(operation);
            else { await setOperation(operationId, "uncertain"); note(operationId); }
            throw unavailable();
          }
        }
        if (!saved) { await cleanup(operation); throw conflict(); }
        await setOperation(operationId, "committed");
        if (profile.submissionId) {
          try { await cleanup(await repo.getOperation(profile.submissionId)); } catch { note(profile.submissionId); }
        }
        return dto(saved);
      } finally { for (const image of images) image.buffer.fill(0); }
    },
    queue: page => repo.queue(page),
    async detail(id) {
      const { profile, user } = await repo.owned(id);
      const history = await repo.history(id);
      return { verification: dto(profile), passenger: { id: String(user._id), fullName: user.fullName, email: user.email }, history: history.map(item => ({ decision: item.decision, reason: item.reason, adminId: String(item.admin), decidedAt: item.decidedAt, revision: item.revision })) };
    },
    async decide(id, adminId, input) { const data = decisionSchema.parse(input); return dto(await repo.review(id, adminId, data)); },
    async document(id, key) {
      const { profile } = await repo.owned(id);
      if (profile.documentsDeletedAt || !/^(cnic-[01]|selfie)$/.test(key)) throw missing();
      const assets = profile.verificationAssets || [];
      const asset = key === "selfie" ? assets.find(asset => asset.kind === "selfie") : assets.filter(asset => asset.kind === "cnic")[Number(key.at(-1))];
      if (!asset) throw missing();
      return storage.read(asset);
    },
    // Called only by the explicit operator tool, not by a public endpoint.
    async retireDocuments(id) { await repo.retire(id); for (const operation of await repo.operationsFor(id)) await cleanup(operation); },
    async reconcile() { for (const operation of await repo.staleOperations(new Date(Date.now() - 3600000))) await cleanup(operation, true); },
  };
  return service;
}
