# Passenger identity verification: operator setup

This guide contains variable names and operator procedures, never credentials. Do not paste secrets or identity documents into chat. No live upload, database update, permission grant or cleanup was executed while implementing this feature.

## Configuration

Set privately in the backend process environment:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
VERIFICATION_SUBMISSIONS_ENABLED
```

Uploads are disabled unless all credentials are present and `VERIFICATION_SUBMISSIONS_ENABLED=true`. Do not set the flag until the product environment supports `image` assets with delivery type `authenticated`, the access/privacy policy is accepted, and the operator is ready for synthetic acceptance tests. Incorrect credentials or unsupported authenticated storage produce 503; there is no public-storage fallback.

Cloudinary API traffic is pinned to `https://api.cloudinary.com`. Configure the intended product environment, not a publicly writable unsigned preset. The adapter requests `backup:false`; confirm backups, revision retention and any account-level transformations/presets do not retain extra document copies contrary to OR-05. Do not rename verification assets outside the application journal.

## Cloudinary Media Library folders (FIX-03)

The configured product environment was confirmed as **dynamic** by a read-only Admin API `config` request with `settings:true` on 2026-11-08. Only the folder-mode result was displayed; no credentials, asset listings or image contents were printed. No upload, asset move, rename, delete or database modification was performed for this check.

Future verification uploads explicitly use `asset_folder:"saheli_safar/verification"` and `use_asset_folder_as_public_id_prefix:false`. Dynamic folders are independent of public ID paths: the existing random `public_id` remains exactly `saheli_safar/verification/<operation-uuid>/<cnic-or-selfie>-<asset-uuid>`, while Media Library places the assets together in `saheli_safar/verification`. That folder is presentation/organization metadata, not an access-control boundary. Delivery remains `image/authenticated` and existing ownership/Admin permission checks remain mandatory.

Previously only the public ID path was supplied, which does not place assets in that Media Library folder in Dynamic Folder mode. Existing images in Home remain there and keep their exact IDs, authenticated delivery, MongoDB references and operation journal entries. Retrieval and deletion use those IDs, not their Media Library folder, so no migration/backfill is required. Restart/deploy the backend code normally before checking a separately approved future synthetic upload; no environment variable or credential change is needed for this fix.

This adapter targets the confirmed Dynamic Folder environment. If using a **Fixed Folder** environment later, `asset_folder` is unsupported: omit it and retain the existing full `public_id`, whose path already determines the fixed folder hierarchy. Never add `folder:"saheli_safar/verification"` on top of the full planned public ID, which would duplicate its prefix and break journal identity. If explicit fixed-folder options are necessary, split the planned ID into its directory (`folder`) and basename (`public_id`) and prove the returned full ID still matches the journal exactly. Fixed mode cannot provide a separate flat Media Library layout while keeping a different existing public ID hierarchy. No fixed-mode fallback or account-mode migration was executed.

If moving the old Home assets is requested later, obtain separate approval for the exact assets. In Dynamic Folder mode, use a folder-only `asset_folder` metadata update or Console move after privately checking each asset's immutable identity/current public ID, authenticated type and MongoDB/journal references. Keep the public ID and delivery type unchanged, then recheck owner/Admin retrieval. Do not use a rename, re-upload, delete or bulk prefix operation. In Fixed Folder mode, a folder move changes public ID semantics; stop and design a separately approved mapping/rollback migration instead. No old asset was moved by FIX-03.

References: [Cloudinary folder modes](https://cloudinary.com/documentation/folder_modes), [Admin API config](https://cloudinary.com/documentation/admin_api#config), [Upload API](https://cloudinary.com/documentation/image_upload_api_reference).

Existing server variables remain required: `MONGODB_URI`, JWT configuration and the existing CORS allowlist. Atlas/a replica set with transactions is required, as with existing onboarding/recovery. New schema indexes must build successfully before accepting traffic. Do not run seed or legacy database-writing tests.

For production use:

- Passenger build: set `EXPO_PUBLIC_API_URL` to the HTTPS API base, including `/api`.
- Admin build: set `VITE_API_BASE_URL` to that HTTPS API base.
- Backend: use HTTPS or a trusted TLS-terminating proxy and configure the existing `TRUST_PROXY_HOPS` to the exact deployment topology. Untrusted callers must not be able to spoof forwarded HTTPS headers.
- Add only the intended frontend origins to `CORS_ORIGIN`.

Production clients and verification routes reject plain HTTP. Local development HTTP is for synthetic test documents only. Do not send real identity images until HTTPS transport, authenticated delivery, permissions, retention and consent have passed acceptance.

## Reviewer authorization

Only Full Access Admins explicitly granted verifyPassengers may perform Passenger identity verification.

These are separate concepts:

- **Admin access level:** the existing architecture derives Full Access from `User.permissions` containing `manageAdmins`; without it, the Admin has Standard Access. `admin.service.js` maps this to the returned `accessLevel` value and adds/removes `manageAdmins` when access changes. There is no new persisted access-level field.
- **verifyPassengers capability:** a separate explicit permission in the same existing array, denied by default. Active Admin authentication, Full Access (`manageAdmins`) **and** this capability are required for the queue, details, protected documents and every review decision. Standard Access remains denied even if verifyPassengers was accidentally retained after demotion. Full Access alone is also insufficient.
- **Passenger identity-verification status:** `not_submitted`, `pending_review`, `approved` or `rejected` belongs to the PassengerProfile. It neither grants Admin permissions nor changes the Passenger's active account/email-verification status.

Existing Admin roles and access management are unchanged. The backend checks both permissions from current database state on each request and again together inside the decision transaction; the UI uses the same Full Access rule plus the explicit capability. No automatic permission grant occurs.

After explicit approval of an exact existing **Full Access** administrator, an authorized database operator can grant the capability using a narrowly filtered operation such as the following, substituting the designated account's ObjectId privately:

```javascript
db.getSiblingDB("saheli_safar").users.updateOne(
  { _id: ObjectId("<designated-admin-id>"), role: "admin", status: "active", permissions: "manageAdmins" },
  { $addToSet: { permissions: "verifyPassengers" } }
)
```

This is a proposed manual configuration action, not an executed command. Verify matchedCount equals 1 and have that Admin sign in again or reload to refresh UI permissions. The backend checks current database permissions on every protected request and again inside review transactions. Revoke with an equivalently narrow `$pull` after approval when appropriate. Do not use the older manageAdmins-only grant script for this capability.

## API contracts

All endpoints require a Bearer access token and return private/no-store responses. File retrieval never returns a Cloudinary URL. Error responses are sanitized JSON with the established error handler.

Passenger:

| Method/path below `/api/passenger/verification` | Contract |
|---|---|
| GET `/me` | `{success:true,verification}` for current token owner |
| POST `/submit` | Multipart: `revision` decimal string, `cnic` one or two files, `selfie` exactly one file; no owner/status/reviewer fields accepted |
| GET `/documents/cnic-0`, `/documents/cnic-1`, `/documents/selfie` | Current owner's current JPEG bytes; non-existent keys return generic 404 |

Verification DTO: status (`not_submitted`, `pending_review`, `approved`, `rejected`), numeric revision, submissionId, submittedAt, reviewedAt, rejectionReason, reverificationReason, submissionAvailable, documentsDeleted and documents containing only `{key,kind}`. No asset public IDs, credentials, storage URLs or image content are returned by the metadata DTO.

Admin, requiring active role=admin plus Full Access (`manageAdmins`) plus explicit `verifyPassengers`:

| Method/path below `/api/admin/passenger-verifications` | Contract |
|---|---|
| GET `/?page=1` | Pending queue, 20 per page, `{submissions,page,hasMore}` |
| GET `/:userId` | Current Passenger identity, verification DTO and most recent 50 decision-history entries |
| GET `/:userId/documents/:key` | Protected current image bytes |
| POST `/:userId/review` | JSON `{revision,submissionId,decision,reason?}`; decisions approved/rejected/reverification_requested; a 2–500-character reason is required for rejection/reverification |

The full decision history remains in MongoDB; the UI intentionally bounds displayed history. Revision and submissionId must match the displayed record. Approve/reject requires pending_review. Explicit reverification is allowed only from approved/rejected, preserves prior history and changes current status to not_submitted. No automatic approval reversal is performed.

## Image and resource limits

- JPEG/PNG only, checked by declared MIME, magic bytes and complete sharp decoding.
- Maximum 5 MiB per file, two CNIC images plus one selfie, 12 megapixels per image.
- Multipart parser: three files, one small text field, four parts; Content-Length above 16 MiB rejected; individual file/count limits also apply to chunked requests.
- Two upload requests processing per backend process; ten submission attempts per IP per 15 minutes, in addition to existing API limits.
- 30-second idle incoming-body timeout; decoded image pipeline timeout five seconds; Cloudinary upload timeout 25 seconds per image; server media fetch timeout 15 seconds and maximum 5 MiB response.
- Images are auto-oriented, resized within 2400 × 2400 without enlargement, converted to JPEG and stripped of EXIF/GPS metadata. No face matching or automatic identity decision is performed.
- Client sends multipart boundaries automatically. No base64 documents, media URLs or selections are stored in browser storage, SecureStore or MongoDB.

## Storage and recovery

Originals and derivatives use **authenticated** delivery. IDs are random under `saheli_safar/verification/`. The server generates a 30-second signed Upload API download request and fetches it itself. Clients receive only authenticated application response bytes with private/no-store, nosniff and no-referrer headers. No permanent signed CDN URL is generated for clients.

`verificationoperations` is a durable operational journal, created with majority acknowledgement before a Cloudinary request. It contains planned random IDs, owner, delivery metadata and operation state, but no images or secrets. `passengerprofiles` receives all required references and pending_review in a single compare-and-set update with majority write concern. Revision checks prevent stale uploads or reviews from overwriting newer state. Admin status and `verificationreviews` history commit together in a MongoDB transaction.

Failed uploads trigger compensating deletions. Definite DB validation rejection/conflict cleans new assets. An ambiguous DB acknowledgement is probed against the primary with majority read concern; if it cannot be resolved, assets remain journaled as uncertain rather than risking deletion of a committed submission. The Passenger must refresh before retrying.

Immediate deletion attempts remain cleanup_pending until a later grace pass repeats deletion. A timed-out provider request can finish after its first deletion attempt. Reconciliation considers operations older than one hour, verifies that no current profile references their assets using a primary majority read, and deletes only unreferenced authenticated images. Operational logs contain only operationId and a fixed code, never document URLs, bytes, credentials or rejection text. There is no cross-system atomic transaction; recovery is eventual and requires these operator passes.

## Authorized maintenance and OR-05 retention

No Passenger account-deletion feature exists. The new operator tool deletes **documents only**, never Users or collections. It defaults to dry run and does not connect unless `--execute` is supplied. It must run in a restricted server environment; it is not a public HTTP endpoint.

From `backend`, after approval:

```powershell
# Dry run: no database connection or deletion.
node scripts/verification-maintenance.js --action reconcile

# After explicit approval: reconcile up to 100 stale operations per pass.
node scripts/verification-maintenance.js --action reconcile --execute

# Before deleting one designated Passenger account, after disabling/draining
# that account's in-flight requests and approving its exact ID:
node scripts/verification-maintenance.js --action account-deletion --user-id <exact-user-id> --execute

# After final FYP evaluation: first disable new submissions, stop/drain workers,
# then explicitly approve the project-wide document cleanup:
node scripts/verification-maintenance.js --action final-evaluation --execute
```

The final-evaluation action refuses to run while VERIFICATION_SUBMISSIONS_ENABLED is true. It clears profile asset references, records documentsDeletedAt and advances revisions so stale submissions/reviews cannot commit. Historical verification decisions remain history, not an operational booking authorization after evaluation. Account deletion must not proceed until document removal has been checked; failures remain in the journal for retry. Never bypass this procedure by deleting User/Profile records or deleting the journal first.

Run reconciliation through an authorized scheduler (for example every five minutes), with concurrency controlled and repeated passes as necessary. It is not automatically scheduled by application startup. Repeat deletion/reconciliation after the one-hour grace and until pending/uncertain unreferenced assets are confirmed cleaned. Because each pass is bounded at 100 operations, large projects require multiple passes. Review namespace inventory privately if a crash/operator modification leaves assets not represented in the journal. Never delete unrelated Cloudinary namespaces.

FIX-03 scheduling audit found no application timer, package task, repository scheduler/deployment job or automatic call that schedules maintenance; the CLI is the only production caller of reconciliation. Local Windows Task Scheduler enumeration was unavailable, and external hosting/scheduler state was not accessible, so an externally configured schedule is **unverified**, not certified absent. No job was created, changed or executed.

Before an operator enables a job: approve its exact product environment/database and maintenance action; use a restricted backend service account with private runtime secrets; preserve profile/journal records and the existing indexes; confirm primary/majority reads and transaction support; validate deletion/retry behavior using synthetic assets; and configure a single worker/non-overlapping lock, bounded passes, sanitized logs and alerts for cleanup_pending/uncertain states. Use the backend directory as the working directory so the intended configuration is loaded. Windows Task Scheduler or the deployment platform's scheduler can run the documented `--action reconcile --execute` command after separate approval. Keep account-deletion/final-evaluation retirement actions separate from routine reconciliation. A completed pass or zero CLI exit code does not certify all documents are gone; verify journal states and provider inventory.

When retention deletion fails, documents can remain restricted in Cloudinary until the retry succeeds; no claim of immediate guaranteed erasure is made. Verify provider-side deletion, backups/revisions and final namespace inventory. The operator must enforce the actual evaluation date; no speculative automatic deletion date is configured. Replaced assets are cleaned only after replacement commits; rejected documents are retained for review/resubmission until replacement, account deletion or final evaluation, whichever applies first.

OR-05 therefore has operational prerequisites still outstanding: no Passenger account-deletion workflow automatically invokes document retirement, no final-evaluation date/trigger is configured in code, and a reconciliation schedule has not been established by this repository. Routine reconciliation deliberately protects referenced approved/rejected images and cannot substitute for retirement. Stop/drain submissions before retirement; confirm actual provider removal before deleting the account or declaring evaluation cleanup complete. The one-hour late-upload grace, provider failure, CDN invalidation delay and backups/revisions can delay verified erasure. `backup:false` on new uploads is not proof that historical backups or additional account-level copies are absent. Do not delete profiles/journal entries first or change Cloudinary IDs outside the journal; unjournaled/missing-record assets require private inventory and a separately approved recovery plan. FIX-03 audits/documents these limitations without running or automatically scheduling cleanup.

## Synthetic live acceptance only

1. Configure a designated development product environment, HTTPS API, CORS and MongoDB transaction/index support. Privately grant verifyPassengers only to a designated active Full Access Admin after approval. Do not reset/seed real accounts.
2. Sign in as an email-verified active Passenger with a valid PassengerProfile. Confirm real Not Submitted status.
3. Choose synthetic CNIC-style and selfie-style JPEG/PNG files; test local previews, replace, cancel, clear, required fields and limits. Test camera/permissions on a physical device using non-sensitive subject matter.
4. Submit once. Verify Cloudinary resources have image/authenticated type and random namespace IDs, originals and transformed variants reject unsigned/public access, and no permanent storage URL appears in API metadata.
5. Verify MongoDB protected references and pending_review; verify account.status remains active and emergency contact/name remain unchanged. Repeat taps must not create extra submissions.
6. In Admin Passengers -> Review identity submissions, open the pending record, view protected synthetic images, reject with a reason and confirm history actor/time.
7. Refresh Passenger status, resubmit corrected synthetic images, then approve as Admin and refresh Passenger status. Check a concurrent second Admin decision receives 409.
8. Verify unauthenticated, Driver, different-Passenger and Admin-without-capability access is denied. A copied protected application URL must require authorization. Verify response headers and no sensitive browser storage/analytics.
9. Exercise synthetic storage/database failure cases in a controlled test environment. Verify unchanged decision on definite failure and journal/reconciliation behavior for uncertain outcomes.
10. Test Web plus physical Android: image selection/capture, foreground revalidation, upload loading, Back, logout, expiry and temporary-cache handling. Local/gallery originals are not deleted; app-owned picker copies and Web object URLs are cleared best-effort on replace, clear, success, blur/logout.
11. Perform approved synthetic-document retirement and verify Cloudinary deletion/journal completion. Keep the final-evaluation operator procedure assigned and scheduled.

Until these steps succeed with user-approved live services, classify the feature as implemented and mock-tested, not Cloudinary-live-tested, real-MongoDB-tested or physical-Android-tested.

No booking endpoint exists. A future reservation handler must independently enforce active Passenger role and current approved identity state on the server, alongside trip/seat rules. Login, Explore and Profile remain available while identity is unsubmitted/pending/rejected. This task does not implement booking eligibility end to end.

## Submission availability and restart requirements

`VERIFICATION_SUBMISSIONS_ENABLED=false` intentionally disables new submissions. `storage.available()` requires the flag to equal the exact string `true`, all three Cloudinary configuration values to be non-empty, and valid cloud-name syntax. GET `/api/passenger/verification/me` returns the stored/default Passenger status independently, with `submissionAvailable = storage.available() && !documentsDeletedAt`. Thus Not Submitted and submission unavailable can both be correct. The screen disables submission and displays its availability notice when that response field is false; this is not a frontend failure. Existing protected viewing/deletion remains possible while new submissions are disabled.

The 2026-11-08 FIX-01 read-only check found all three Cloudinary names present/non-empty and the flag exactly false in `backend/.env`. No secret values were displayed or changed. Credential validity, product-environment support and the running backend process's actual environment are not certified by a file check.

To enable submissions safely, after security acceptance:

1. Keep the flag false while checking authenticated Cloudinary originals/derivatives, HTTPS/proxy/CORS, accepted privacy/retention/consent policy, MongoDB transaction/index readiness and reconciliation ownership/scheduling.
2. Designate an existing active Full Access Admin and separately authorize/grant verifyPassengers if absent. Do not grant it to everyone or upgrade a Standard Admin implicitly. Reload/sign in again to refresh Admin UI permissions.
3. Have the authorized operator privately verify all three backend Cloudinary values against the intended product environment. Do not put them in Passenger/Admin public variables or logs.
4. Only after approval, set `VERIFICATION_SUBMISSIONS_ENABLED=true` in the intended backend runtime configuration and **restart that backend process**. `src/server.js` loads dotenv at startup; editing `.env` is not hot reloading. A process/service-manager environment may override the file and must be checked privately. No flag/environment change or restart of a running backend was performed in FIX-01.
5. Refresh Passenger Identity Verification. Its authenticated GET must show `submissionAvailable:true` for an eligible profile without a document-retirement marker. Status remains Not Submitted until a real successful submission. Availability is a local configuration check, not a live Cloudinary credential probe.
6. If API host changes, set the Passenger HTTPS `EXPO_PUBLIC_API_URL` (including `/api`) in the correct build/development environment. With no override, the current code uses Web page host or Expo development host on port 5000. The phone must reach that host; localhost on the phone is the phone itself. Restart Expo and reload the app after public URL changes (a production app needs a rebuild/update). Restart/rebuild Vite if changing `VITE_API_BASE_URL`. A backend-only flag change does not require an Expo rebuild or Metro restart; refresh status after the backend restarts.
7. Perform the synthetic live acceptance checklist above in the approved test environment. Verify permission denials, protected Cloudinary delivery, MongoDB state/history and failure recovery before real identity data. No image upload or live database write was performed in FIX-01.
