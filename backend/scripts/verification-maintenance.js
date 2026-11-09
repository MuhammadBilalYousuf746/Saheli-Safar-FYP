// Operator-only, dry run by default. Never run automatically at startup/tests.
import "dotenv/config";
import mongoose from "mongoose";
import { parseArgs } from "node:util";
import { connectDB } from "../src/config/db.js";
import PassengerProfile from "../src/modules/passenger/passenger.model.js";
import { createVerificationService } from "../src/modules/verification/verification.service.js";

async function run() {
  const { values } = parseArgs({ options: { execute: { type: "boolean", default: false }, action: { type: "string" }, "user-id": { type: "string" } } });
  if (!["reconcile", "account-deletion", "final-evaluation"].includes(values.action)) throw new Error("Choose --action reconcile, account-deletion or final-evaluation.");
  if (values.action === "account-deletion" && !mongoose.isObjectIdOrHexString(values["user-id"])) throw new Error("Specify the exact --user-id before account deletion.");
  if (!values.execute) { console.log("DRY RUN: no connection or deletion. Add --execute only after operator approval and configuration review."); return; }
  if (values.action === "final-evaluation" && process.env.VERIFICATION_SUBMISSIONS_ENABLED === "true") throw new Error("Disable verification submissions and stop/drain request workers before final-evaluation cleanup.");
  await connectDB();
  const service = createVerificationService();
  if (values.action === "account-deletion") await service.retireDocuments(values["user-id"]);
  if (values.action === "final-evaluation") {
    for await (const profile of PassengerProfile.find({}).select("user").cursor()) await service.retireDocuments(String(profile.user));
  }
  await service.reconcile();
  console.log("Cleanup pass completed. Inspect pending journal states; retry after one hour until all retired operations are cleaned. No Users were deleted.");
}
run().catch(() => { console.error("Verification maintenance failed. Check configuration/connection privately; no sensitive details are logged."); process.exitCode = 1; }).finally(() => mongoose.disconnect());
