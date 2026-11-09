import test from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import mongoose from "mongoose";
import express from "express";
import sharp from "sharp";
import jwt from "jsonwebtoken";
mongoose.set("autoCreate", false); mongoose.set("autoIndex", false);
const { createVerificationService, createMongooseVerificationRepo } = await import("../src/modules/verification/verification.service.js");
const { createVerificationStorage, ASSET_FOLDER, ASSET_PREFIX } = await import("../src/modules/verification/verification-storage.js");
const { validateVerificationImages, MAX_IMAGE_BYTES } = await import("../src/modules/verification/verification-images.js");
const { createPassengerVerificationRoutes, createAdminVerificationRoutes } = await import("../src/modules/verification/verification.routes.js");
const { default: User } = await import("../src/modules/auth/user.model.js");
const { default: PassengerProfile } = await import("../src/modules/passenger/passenger.model.js");
const { VerificationReview } = await import("../src/modules/verification/verification.model.js");
const { createAccessToken } = await import("../src/modules/auth/token.service.js");
const { errorHandler } = await import("../src/middlewares/errorHandler.js");
const { createError } = await import("../src/utils/app-error.js");
process.env.JWT_ACCESS_SECRET = "isolated-verification-secret-at-least-32-characters";
// Synthetic flat color pixels only. No .env, Mongo connection or live SDK calls.
const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: "#775577" } }).png().toBuffer();
const jpeg = await sharp(png).jpeg().toBuffer();
const id = "0123456789abcdef01234567", other = "111111111111111111111111", adminId = "222222222222222222222222", deniedId = "333333333333333333333333", driverId = "444444444444444444444444";
const clone = value => structuredClone(value);
const files = () => ({ cnic: [{ mimetype: "image/png", buffer: Buffer.from(png) }], selfie: [{ mimetype: "image/jpeg", buffer: Buffer.from(jpeg) }] });
function fixture() {
  const state = { profile: { user: id, verificationStatus: "not_submitted", verificationRevision: 0, verificationAssets: [], documentsDeletedAt: null }, operations: new Map(), history: [], uploads: [], removals: [], logs: [], failUpload: 0, failDb: false, unknownDb: false, lostAck: false, failCleanup: false, failHistory: false, configured: true };
  const accounts = new Map([[id, { _id: id, role: "passenger", status: "active", isEmailVerified: true, fullName: "Synthetic Passenger", authVersion: 0 }], [other, { _id: other, role: "passenger", status: "active", authVersion: 0 }], [adminId, { _id: adminId, role: "admin", status: "active", permissions: ["manageAdmins", "verifyPassengers"], authVersion: 0 }], [deniedId, { _id: deniedId, role: "admin", status: "active", permissions: ["manageAdmins"], authVersion: 0 }], [driverId, { _id: driverId, role: "driver", status: "active", authVersion: 0 }]]);
  const storage = {
    available: () => state.configured,
    assertAvailable() { if (!state.configured) throw createError("Secure document storage is unavailable.", 503); },
    async upload(asset) { state.uploads.push(clone(asset)); if (state.uploads.length === state.failUpload) throw createError("Upload failed.", 503); await state.onUpload?.(); },
    async remove(asset) { state.removals.push(clone(asset)); if (state.failCleanup) throw new Error("Synthetic deletion failure"); },
    async read() { if (state.failRead) throw createError("Unable to retrieve this document.", 503); return jpeg; },
  };
  const repo = {
    async owned(owner) { const user = accounts.get(owner); if (owner !== id || !user || user.status !== "active" || !user.isEmailVerified) throw createError("Verification record not available.", 404); return { profile: clone(state.profile), user }; },
    async swap(owner, revision, fields, statuses) {
      if (state.failDb) throw Object.assign(new Error("Synthetic DB rejection"), { code: 121 });
      if (state.unknownDb) throw new Error("Synthetic lost write outcome");
      if (owner !== id || state.profile.verificationRevision !== revision || state.profile.documentsDeletedAt || !statuses.includes(state.profile.verificationStatus || "not_submitted")) return null;
      Object.assign(state.profile, clone(fields), { verificationRevision: revision + 1 });
      if (state.lostAck) throw new Error("Synthetic lost acknowledgement");
      return clone(state.profile);
    },
    async bySubmission(owner, submissionId) { if (state.failProbe) throw new Error("Probe unavailable"); return owner === id && state.profile.submissionId === submissionId ? clone(state.profile) : null; },
    async createOperation(operation) { state.operations.set(operation._id, clone(operation)); },
    async getOperation(operationId) { return state.operations.get(operationId); },
    async setOperation(operationId, status) { state.operations.get(operationId).state = status; },
    async references(assets) { return assets.some(asset => state.profile.verificationAssets.some(current => current.publicId === asset.publicId)); },
    async history() { return clone(state.history); },
    async queue(page) { return { submissions: state.profile.verificationStatus === "pending_review" ? [{ userId: id, fullName: "Synthetic Passenger" }] : [], page, hasMore: false }; },
    async review(owner, actor, data) {
      const admin = accounts.get(actor);
      if (admin?.role !== "admin" || admin.status !== "active" || !["manageAdmins", "verifyPassengers"].every(permission => admin.permissions?.includes(permission))) throw createError("Permission required.", 403);
      const previous = state.profile;
      const allowed = data.decision === "reverification_requested" ? ["approved", "rejected"] : ["pending_review"];
      if (owner !== id || previous.submissionId !== data.submissionId || previous.verificationRevision !== data.revision || !allowed.includes(previous.verificationStatus)) throw createError("Conflict.", 409);
      if (state.failHistory) throw new Error("Synthetic transaction failure");
      const now = new Date(), revision = data.revision + 1;
      const decision = { passenger: owner, admin: actor, decidedAt: now, revision, decision: data.decision, reason: data.reason || null };
      state.history.push(decision);
      Object.assign(previous, { verificationRevision: revision, verificationStatus: data.decision === "reverification_requested" ? "not_submitted" : data.decision, reviewedBy: actor, reviewedAt: now, rejectionReason: data.decision === "rejected" ? data.reason : null });
      return clone(previous);
    },
    async retire() { state.profile.verificationAssets = []; state.profile.documentsDeletedAt = new Date(); state.profile.verificationRevision++; },
    async operationsFor() { return [...state.operations.values()]; },
    async staleOperations() { return [...state.operations.values()].filter(operation => operation.state !== "cleaned"); },
  };
  const service = createVerificationService({ repo, storage, log: event => state.logs.push(event) });
  const submit = () => service.submit(id, { revision: String(state.profile.verificationRevision) }, files());
  const decide = (decision, reason) => service.decide(id, adminId, { decision, reason, revision: state.profile.verificationRevision, submissionId: state.profile.submissionId });
  return { state, accounts, repo, service, submit, decide };
}

test("valid synthetic JPEG and PNG are fully decoded, normalized and metadata stripped", async () => {
  const normalized = await validateVerificationImages(files());
  assert.equal(normalized.length, 2);
  for (const image of normalized) { const metadata = await sharp(image.buffer).metadata(); assert.equal(metadata.format, "jpeg"); assert.equal(metadata.exif, undefined); }
});
test("missing CNIC, missing selfie and excessive image count are rejected", async () => {
  for (const input of [{ selfie: files().selfie }, { cnic: files().cnic }, { ...files(), cnic: Array(3).fill(files().cnic[0]) }]) await assert.rejects(validateVerificationImages(input), { statusCode: 400 });
});
test("spoofed MIME, SVG, corrupt image and oversized content are rejected", async () => {
  for (const file of [{ mimetype: "image/jpeg", buffer: png }, { mimetype: "image/png", buffer: Buffer.from("<svg/>") }, { mimetype: "image/png", buffer: png.subarray(0, 20) }]) await assert.rejects(validateVerificationImages({ ...files(), cnic: [file] }), { statusCode: 400 });
  await assert.rejects(validateVerificationImages({ ...files(), cnic: [{ mimetype: "image/png", buffer: Buffer.alloc(MAX_IMAGE_BYTES + 1) }] }), { statusCode: 413 });
});
test("decompression dimensions above twelve megapixels are rejected", async () => {
  const large = await sharp({ create: { width: 4000, height: 4000, channels: 3, background: "#775577" } }).png().toBuffer();
  await assert.rejects(validateVerificationImages({ ...files(), cnic: [{ mimetype: "image/png", buffer: large }] }), { statusCode: 400 });
});
test("validation failure performs no upload or verification mutation", async () => {
  const f = fixture(); await assert.rejects(f.service.submit(id, { revision: "0" }, {})); assert.equal(f.state.uploads.length, 0); assert.equal(f.state.operations.size, 0); assert.equal(f.state.profile.verificationStatus, "not_submitted");
});
test("successful submission returns only sanitized metadata and actual pending status", async () => {
  const f = fixture(), result = await f.submit();
  assert.equal(result.status, "pending_review"); assert.equal((await f.service.mine(id)).status, "pending_review"); assert.equal(result.documents.length, 2);
  assert.equal(f.state.uploads.length, 2); assert.equal(f.state.operations.get(result.submissionId).state, "committed");
  assert.equal(/publicId|cloudinary|api_secret|secure_url/.test(JSON.stringify(result)), false);
});
test("missing storage configuration fails closed", async () => {
  const f = fixture(); f.state.configured = false;
  await assert.rejects(f.submit(), { statusCode: 503 }); assert.equal(f.state.uploads.length, 0); assert.equal(f.state.profile.verificationStatus, "not_submitted");
});
for (const failUpload of [1, 2]) test(`upload ${failUpload} failure preserves old status and compensates planned assets`, async () => {
  const f = fixture(); f.state.failUpload = failUpload;
  await assert.rejects(f.submit(), { statusCode: 503 }); assert.equal(f.state.profile.verificationStatus, "not_submitted"); assert.equal(f.state.removals.length, 2);
  assert.equal([...f.state.operations.values()][0].state, "cleanup_pending");
});
test("known DB rejection cleans new assets and preserves previous record", async () => {
  const f = fixture(); f.state.failDb = true; const before = clone(f.state.profile);
  await assert.rejects(f.submit(), { statusCode: 503 }); assert.deepEqual(f.state.profile, before); assert.equal(f.state.removals.length, 2);
});
test("lost DB acknowledgement is resolved without deleting committed assets", async () => {
  const f = fixture(); f.state.lostAck = true; assert.equal((await f.submit()).status, "pending_review"); assert.equal(f.state.removals.length, 0);
});
test("unknown write outcome retains journal and assets for reconciliation", async () => {
  const f = fixture(); f.state.unknownDb = true; f.state.failProbe = true;
  await assert.rejects(f.submit(), { statusCode: 503 }); assert.equal([...f.state.operations.values()][0].state, "uncertain"); assert.equal(f.state.removals.length, 0);
  f.state.failProbe = false; await f.service.reconcile(); assert.equal(f.state.removals.length, 2);
});
test("cleanup failure logs only operation ID and operational code", async () => {
  const f = fixture(); f.state.failUpload = 2; f.state.failCleanup = true;
  await assert.rejects(f.submit()); assert.ok(f.state.logs.length); assert.deepEqual(Object.keys(f.state.logs[0]).sort(), ["code", "operationId"]);
  assert.equal([...f.state.operations.values()][0].state, "cleanup_pending");
});
test("concurrent submissions produce one accepted result and one conflict", async () => {
  const f = fixture(); const results = await Promise.allSettled([f.submit(), f.submit()]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1); assert.equal(results.find(result => result.status === "rejected").reason.statusCode, 409);
});
test("a stale upload cannot overwrite a newly recorded Admin decision", async () => {
  const f = fixture(); f.state.onUpload = () => { f.state.profile.verificationStatus = "approved"; f.state.profile.verificationRevision++; };
  await assert.rejects(f.submit(), { statusCode: 409 }); assert.equal(f.state.profile.verificationStatus, "approved");
});
test("pending and approved Passengers cannot resubmit or self-change a decision", async () => {
  const f = fixture(); await f.submit(); await assert.rejects(f.submit(), { statusCode: 409 }); await f.decide("approved"); await assert.rejects(f.submit(), { statusCode: 409 });
  await assert.rejects(f.service.submit(id, { revision: "2", verificationStatus: "approved" }, files()), { name: "ZodError" });
});
test("authorized Admin queue, approval, history actor and timestamp are real service state", async () => {
  const f = fixture(); await f.submit(); assert.equal((await f.service.queue(1)).submissions.length, 1);
  assert.equal((await f.decide("approved")).status, "approved"); const history = (await f.service.detail(id)).history;
  assert.equal(history[0].adminId, adminId); assert.ok(history[0].decidedAt instanceof Date); assert.equal(history[0].decision, "approved");
});
test("rejection requires reason and permits corrected resubmission with safe old-asset cleanup", async () => {
  const f = fixture(); await f.submit(); const old = f.state.profile.submissionId;
  await assert.rejects(f.decide("rejected"), { name: "ZodError" }); assert.equal(f.state.profile.verificationStatus, "pending_review");
  await f.decide("rejected", "Please use a clearer image."); assert.equal((await f.service.mine(id)).rejectionReason, "Please use a clearer image.");
  await f.submit(); assert.equal(f.state.profile.verificationStatus, "pending_review"); assert.notEqual(f.state.profile.submissionId, old); assert.equal(f.state.removals.length, 2);
});
test("concurrent Admin reviews conflict and failed history transaction leaves old state", async () => {
  const f = fixture(); await f.submit(); const data = { revision: 1, submissionId: f.state.profile.submissionId };
  const results = await Promise.allSettled([f.service.decide(id, adminId, { ...data, decision: "approved" }), f.service.decide(id, adminId, { ...data, decision: "rejected", reason: "Synthetic reason" })]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1); assert.equal(f.state.history.length, 1);
  const g = fixture(); await g.submit(); g.state.failHistory = true; await assert.rejects(g.decide("approved")); assert.equal(g.state.profile.verificationStatus, "pending_review");
});
test("authorized explicit reverification preserves previous decision history", async () => {
  const f = fixture(); await f.submit(); await f.decide("approved"); await f.decide("reverification_requested", "Updated documents required.");
  assert.equal(f.state.profile.verificationStatus, "not_submitted"); assert.equal(f.state.history.length, 2); assert.equal(f.state.history[0].decision, "approved");
});
test("image retrieval failure does not change status; retirement removes document access and reconciles assets", async () => {
  const f = fixture(); await f.submit(); f.state.failRead = true; await assert.rejects(f.service.document(id, "selfie"), { statusCode: 503 }); assert.equal(f.state.profile.verificationStatus, "pending_review");
  await f.service.retireDocuments(id); await assert.rejects(f.service.document(id, "selfie"), { statusCode: 404 }); await f.service.reconcile(); assert.ok([...f.state.operations.values()].every(operation => operation.state === "cleaned"));
});

test("generated CNIC/selfie IDs retain the original random journal/profile identity contract", async () => {
  const f = fixture(); await f.submit();
  assert.equal(ASSET_PREFIX, "saheli_safar/verification/");
  const journal = f.state.operations.get(f.state.profile.submissionId);
  assert.deepEqual(f.state.profile.verificationAssets, journal.assets);
  assert.equal(new Set(journal.assets.map(item => item.publicId)).size, 2);
  for (const item of journal.assets) assert.match(item.publicId, new RegExp(`^saheli_safar/verification/${journal._id}/${item.kind}-[a-f0-9-]{36}$`));
});

for (const decision of ["approved", "rejected"]) test(`${decision} documents remain referenced and reconciliation does not delete them`, async () => {
  const f = fixture(); await f.submit(); await f.decide(decision, decision === "rejected" ? "Synthetic correction needed." : undefined);
  const before = clone(f.state.profile); await f.service.reconcile();
  assert.deepEqual(f.state.profile, before); assert.equal(f.state.removals.length, 0);
  assert.equal(f.state.operations.get(before.submissionId).state, "committed");
});

test("replacement cleanup checks old references only after the new submission commits", async () => {
  const f = fixture(); await f.submit(); await f.decide("rejected", "Synthetic correction needed.");
  const oldSubmission = f.state.profile.submissionId, oldAssets = clone(f.state.profile.verificationAssets);
  f.state.onUpload = () => { assert.equal(f.state.profile.submissionId, oldSubmission); assert.equal(f.state.removals.length, 0); };
  const references = f.repo.references;
  f.repo.references = async assets => {
    if (assets.some(item => oldAssets.some(old => old.publicId === item.publicId))) {
      assert.notEqual(f.state.profile.submissionId, oldSubmission); assert.equal(f.state.profile.verificationStatus, "pending_review");
      assert.deepEqual(f.state.profile.verificationAssets, f.state.operations.get(f.state.profile.submissionId).assets);
    }
    return references(assets);
  };
  await f.submit(); assert.deepEqual(f.state.removals, oldAssets);
});

test("failed replacement preserves the rejected profile and never removes its old assets", async () => {
  const f = fixture(); await f.submit(); await f.decide("rejected", "Synthetic correction needed.");
  const before = clone(f.state.profile); f.state.failUpload = f.state.uploads.length + 2;
  await assert.rejects(f.submit(), { statusCode: 503 }); assert.deepEqual(f.state.profile, before);
  assert.equal(f.state.removals.some(item => before.verificationAssets.some(old => old.publicId === item.publicId)), false);
});

test("even one live reference prevents deleting any asset from its journal operation", async () => {
  const f = fixture(); await f.submit(); f.state.profile.verificationAssets = [f.state.profile.verificationAssets[0]];
  await f.service.reconcile(); assert.equal(f.state.removals.length, 0);
});

test("a failed reference check fails closed and leaves cleanup retryable", async () => {
  const f = fixture(); await f.submit(); f.repo.references = async () => { throw new Error("Synthetic reference read failure"); };
  await f.service.reconcile(); assert.equal(f.state.removals.length, 0);
  assert.equal(f.state.operations.get(f.state.profile.submissionId).state, "cleanup_pending"); assert.ok(f.state.logs.length);
});

test("failed deletions are retried and cleaned operations are not selected again", async () => {
  const f = fixture(); f.state.failUpload = 2; f.state.failCleanup = true;
  await assert.rejects(f.submit()); assert.equal([...f.state.operations.values()][0].state, "cleanup_pending");
  f.state.failCleanup = false; await f.service.reconcile();
  assert.equal([...f.state.operations.values()][0].state, "cleaned"); const calls = f.state.removals.length;
  await f.service.reconcile(); assert.equal(f.state.removals.length, calls);
});
test("profile owner index is preserved and protected references are excluded by default", () => {
  assert.equal(PassengerProfile.schema.path("user").options.unique, true); assert.equal(PassengerProfile.schema.path("verificationAssets").options.select, false);
  assert.ok(VerificationReview.schema.indexes().some(([fields, options]) => fields.passenger === 1 && fields.revision === 1 && options.unique));
});

const asset = { kind: "cnic", publicId: "saheli_safar/verification/00000000-0000-4000-8000-000000000000/cnic-11111111-1111-4111-8111-111111111111", format: "jpg", deliveryType: "authenticated", resourceType: "image" };
function sdkFixture() {
  const calls = [], readIds = []; let delivery = "authenticated", removalResult = "ok";
  const sdk = { uploader: {
    upload_stream(options, done) { calls.push(options); const stream = new PassThrough(); stream.resume(); stream.on("finish", () => done(null, { type: delivery, resource_type: "image", public_id: options.public_id, format: "jpg" })); return stream; },
    async destroy(publicId, options) { calls.push({ publicId, ...options }); return { result: removalResult }; },
  }, utils: { private_download_url(publicId, _format, options) { readIds.push(publicId); calls.push(options); return "https://api.cloudinary.com/v1_1/test/image/download"; } } };
  const env = { CLOUDINARY_CLOUD_NAME: "isolated", CLOUDINARY_API_KEY: "test-key", CLOUDINARY_API_SECRET: "test-secret", VERIFICATION_SUBMISSIONS_ENABLED: "true" };
  const storage = createVerificationStorage({ sdk, env, fetchImpl: async url => { assert.ok(url.startsWith("https://api.cloudinary.com/")); return new Response(jpeg, { headers: { "content-type": "image/jpeg" } }); } });
  return { storage, calls, readIds, env, setDelivery: value => { delivery = value; }, setRemovalResult: value => { removalResult = value; } };
}
test("Cloudinary adapter enforces authenticated original/derived protection, random namespace and HTTPS server-only retrieval", async () => {
  const f = sdkFixture(); assert.equal(await f.storage.upload(asset, jpeg), undefined); assert.equal(f.calls[0].type, "authenticated"); assert.equal(f.calls[0].resource_type, "image"); assert.equal(f.calls[0].overwrite, false); assert.equal(f.calls[0].backup, false);
  assert.deepEqual(await f.storage.read(asset), jpeg); assert.ok(f.calls[1].expires_at <= Date.now() / 1000 + 30); await f.storage.remove(asset); assert.equal(f.calls[2].type, "authenticated");
});

test("future Dynamic Folder uploads set only the Media Library folder and retain exact planned public IDs", async () => {
  for (const kind of ["cnic", "selfie"]) {
    const f = sdkFixture(), planned = { ...asset, kind, publicId: asset.publicId.replace("/cnic-", `/${kind}-`) }, before = clone(planned);
    await f.storage.upload(planned, jpeg); const options = f.calls[0];
    assert.equal(ASSET_FOLDER, "saheli_safar/verification"); assert.equal(options.asset_folder, ASSET_FOLDER);
    assert.equal(options.use_asset_folder_as_public_id_prefix, false); assert.equal(options.public_id, planned.publicId);
    assert.equal(options.folder, undefined); assert.equal(options.public_id_prefix, undefined);
    assert.equal(options.type, "authenticated"); assert.equal(options.resource_type, "image"); assert.equal(options.overwrite, false); assert.equal(options.backup, false);
    assert.deepEqual(planned, before);
  }
});

test("existing references without folder metadata still read and delete by their exact authenticated ID", async () => {
  const f = sdkFixture(), before = clone(asset);
  assert.deepEqual(await f.storage.read(asset), jpeg); assert.equal(f.readIds[0], asset.publicId);
  await f.storage.remove(asset); assert.equal(f.calls[1].publicId, asset.publicId); assert.equal(f.calls[1].type, "authenticated");
  assert.deepEqual(asset, before);
});

test("authenticated deletion accepts not-found retries and rejects unrelated paths and failed provider results", async () => {
  const f = sdkFixture(); f.setRemovalResult("not found"); await f.storage.remove(asset);
  f.setRemovalResult("error"); await assert.rejects(f.storage.remove(asset), { statusCode: 503 });
  const calls = f.calls.length;
  for (const invalid of [{ ...asset, publicId: "website/unrelated-image" }, { ...asset, deliveryType: "upload" }, { ...asset, resourceType: "raw" }]) await assert.rejects(f.storage.remove(invalid), { statusCode: 503 });
  assert.equal(f.calls.length, calls, "Unrelated or incorrectly typed assets must not reach provider deletion");
});
test("public delivery responses and absent Cloudinary credentials fail closed", async () => {
  const f = sdkFixture(); f.setDelivery("upload"); await assert.rejects(f.storage.upload(asset, jpeg), { statusCode: 503 });
  delete f.env.CLOUDINARY_API_SECRET; assert.equal(f.storage.available(), false); await assert.rejects(f.storage.upload(asset, jpeg), { statusCode: 503 });
  await assert.rejects(f.storage.read({ ...asset, publicId: "arbitrary/path" }), { statusCode: 503 });
});

test("actual HTTP auth, ownership, multipart bounds, permissions, protected images and Admin review contracts", async t => {
  const f = fixture();
  t.mock.method(mongoose, "connect", () => { throw new Error("Live MongoDB is forbidden"); });
  t.mock.method(User, "findById", userId => ({ select: async () => f.accounts.get(String(userId)) || null }));
  const app = express(); app.use(express.json()); app.use("/api/passenger/verification", createPassengerVerificationRoutes(f.service)); app.use("/api/admin/passenger-verifications", createAdminVerificationRoutes(f.service)); app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1"); await new Promise(resolve => server.once("listening", resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = owner => ({ Authorization: `Bearer ${createAccessToken(f.accounts.get(owner))}` });
  const form = ({ cnic = true, selfie = true, spoof = false, large = false, extra = false } = {}) => {
    const body = new FormData(); body.set("revision", "0");
    if (cnic) body.append("cnic", new Blob([large ? Buffer.alloc(MAX_IMAGE_BYTES + 1) : png], { type: spoof ? "image/jpeg" : "image/png" }), "synthetic.png");
    if (selfie) body.append("selfie", new Blob([jpeg], { type: "image/jpeg" }), "synthetic.jpg");
    if (extra) body.append("userId", other); return body;
  };
  const submit = (owner, options) => fetch(base + "/api/passenger/verification/submit", { method: "POST", headers: owner ? headers(owner) : {}, body: form(options) });
  assert.equal((await submit()).status, 401); assert.equal((await submit(driverId)).status, 403);
  for (const options of [{ cnic: false }, { selfie: false }, { spoof: true }, { extra: true }]) assert.equal((await submit(id, options)).status, 400);
  assert.equal((await submit(id, { large: true })).status, 413);
  assert.equal((await submit(id)).status, 200);
  const media = "/api/passenger/verification/documents/selfie";
  assert.equal((await fetch(base + media)).status, 401); assert.equal((await fetch(base + media, { headers: headers(other) })).status, 404); assert.equal((await fetch(base + media, { headers: headers(driverId) })).status, 403);
  const image = await fetch(base + media, { headers: headers(id) }); assert.equal(image.status, 200); assert.match(image.headers.get("cache-control"), /private, no-store/); assert.equal(image.headers.get("content-type"), "image/jpeg");
  const previousEnvironment = process.env.NODE_ENV;
  t.after(() => { if (previousEnvironment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousEnvironment; });
  process.env.NODE_ENV = "production";
  assert.equal((await fetch(base + media, { headers: headers(id) })).status, 403, "Production document access must reject plain HTTP");
  if (previousEnvironment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousEnvironment;
  const expired = jwt.sign({ tokenType: "access", role: "passenger", authVersion: 0 }, process.env.JWT_ACCESS_SECRET, { algorithm: "HS256", subject: id, issuer: "saheli-safar-api", audience: "saheli-safar-apps", expiresIn: -1 });
  assert.equal((await fetch(base + media, { headers: { Authorization: `Bearer ${expired}` } })).status, 401);
  const admin = "/api/admin/passenger-verifications";
  assert.equal((await fetch(base + admin, { headers: headers(deniedId) })).status, 403);
  assert.equal((await fetch(base + admin + `/${id}/documents/selfie`, { headers: headers(deniedId) })).status, 403);
  assert.equal((await fetch(base + admin, { headers: headers(adminId) })).status, 200);
  assert.equal((await fetch(base + admin + `/${id}/documents/selfie`, { headers: headers(adminId) })).status, 200);
  assert.equal((await fetch(base + admin + `/${id}/review`, { method: "POST", headers: { ...headers(adminId), "Content-Type": "application/json" }, body: JSON.stringify({ revision: 1, submissionId: f.state.profile.submissionId, decision: "approved" }) })).status, 200);
  f.accounts.get(id).authVersion++;
  // Tokens issued before revocation/expiry cannot access images.
  const old = createAccessToken({ ...f.accounts.get(id), authVersion: 0 });
  assert.equal((await fetch(base + media, { headers: { Authorization: `Bearer ${old}` } })).status, 401);
  const beforeDisable = headers(id); f.accounts.get(id).status = "disabled"; assert.equal((await fetch(base + media, { headers: beforeDisable })).status, 403);
});

test("Mongoose submission predicate admits legacy missing fields and increments only verification revision", async t => {
  let captured;
  t.mock.method(PassengerProfile, "findOneAndUpdate", (filter, update, options) => { captured = { filter, update, options }; return { select: async field => { assert.equal(field, "+verificationAssets"); return null; } }; });
  await createMongooseVerificationRepo().swap(id, 0, { verificationStatus: "pending_review" }, ["not_submitted", "rejected"]);
  assert.equal(captured.filter.user, id); assert.equal(captured.filter.documentsDeletedAt, null);
  assert.equal(captured.filter.$and[0].$or[1].verificationRevision.$exists, false);
  assert.equal(captured.filter.$and[1].$or[1].verificationStatus.$exists, false);
  assert.deepEqual(captured.update.$inc, { verificationRevision: 1 }); assert.equal(captured.options.runValidators, true);
});

test("Mongoose review uses one transaction for actor/target checks, CAS and immutable decision history", async t => {
  const session = { isolated: true }; let checks = 0, history, changes;
  t.mock.method(VerificationReview, "init", async () => {});
  t.mock.method(mongoose.connection, "transaction", async callback => callback(session));
  t.mock.method(User, "findOne", filter => ({ session: async value => { assert.equal(value, session); checks++; if (filter.role === "admin") assert.deepEqual(filter.permissions, { $all: ["manageAdmins", "verifyPassengers"] }); else assert.equal(filter.isEmailVerified, true); return { _id: filter._id }; } }));
  t.mock.method(PassengerProfile, "findOneAndUpdate", (filter, update, options) => { changes = { filter, update, options }; assert.equal(options.session, session); return { select: async () => ({ verificationRevision: 2 }) }; });
  t.mock.method(VerificationReview, "create", async (documents, options) => { assert.equal(options.session, session); history = documents[0]; });
  const repo = createMongooseVerificationRepo(); const input = { revision: 1, submissionId: "00000000-0000-4000-8000-000000000000", decision: "rejected", reason: "Synthetic reason" };
  await repo.review(id, adminId, input);
  assert.equal(checks, 2); assert.equal(changes.filter.submissionId, input.submissionId); assert.equal(changes.filter.verificationRevision, 1);
  assert.deepEqual(changes.filter.verificationStatus, { $in: ["pending_review"] }); assert.equal(history.admin, adminId); assert.equal(history.passenger, id); assert.equal(history.revision, 2); assert.ok(history.decidedAt instanceof Date);
  t.mock.method(VerificationReview, "create", async () => { throw new Error("Synthetic history insert failure"); });
  await assert.rejects(repo.review(id, adminId, input), /Synthetic history insert failure/, "Transaction failure must propagate for database rollback");
});
