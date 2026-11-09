# DB-STRUCTURE-FIX-01

Date: 8 November 2026. Repository: `D:\SaheliSafar-FYP`. Intended database: `saheli_safar`.

## Decision and reference documents

Keep the shared `users` identity model. It validly implements the common authentication portion of separate conceptual PASSENGER, DRIVER and ADMIN entities. A role entity is represented by its User plus its owned profile; it does not require a separate password-bearing collection.

Inspected the relevant text from all three local reference PDFs:

- `C:\Users\mbila\OneDrive\Desktop\FYP Documents\SaheliSafar-SRS_(Bilal&Ramiq)_v1.2.pdf`
- `C:\Users\mbila\OneDrive\Desktop\FYP Documents\ERD\SaheliSafar_Panel_Ready_4_Views.pdf`
- `C:\Users\mbila\OneDrive\Desktop\FYP Documents\ERD\SaheliSafar_ERD_SRS_Validation_Notes.pdf`

The corresponding SRS v1.2 DOCX was also available. The SRS identifies v1.2 as supervisor-approved, dated 26 October 2026. Sections 1.4 and 2.1 specify the common backend/database and phase allocation. Sections 4.1-4.3 specify registration, role-based access and one emergency contact. The validation notes explicitly call the 22-entity ERD conceptual/logical, leave physical schema details to TBD-04 and allow MongoDB document references/enforceable relationships. This is structural alignment of implemented features, not a claim that the entire SRS is implemented or verified.

No real database connection was opened. Live collections, documents, index definitions, cleanup completion and deployed runtime settings remain unverified. The deleted `passengerprofiles` collection is a user-reported incident, not independently observed here. No credentials or environment files were read.

## Current identity and relationship mapping

| Logical relationship | Physical implementation | Constraint and behavior |
|---|---|---|
| PASSENGER identity | `User` / `users`, `role=passenger` | Required immutable role; shared name, email, phone, password hash and account state |
| Passenger role data | `PassengerProfile` / `passengerprofiles` | Required immutable `user` ObjectId referencing `User`; declared unique `{user:1}` |
| DRIVER identity and profile | `User` / `users`, `role=driver` + `DriverProfile` / `driverprofiles` | Same required immutable unique owner; driver CNIC, license, vehicle and verification fields live in profile |
| ADMIN identity and profile | `User` / `users`, `role=admin` + `AdminProfile` / `adminprofiles` | Same required immutable unique owner; authentication and permissions live in User |
| Emergency contact | `PassengerProfile.emergencyContact` | Nullable single embedded subdocument, never an array; no independent collection or duplicated owner needed |

User declares unique sparse email and phone indexes and `{role:1,status:1}`. DriverProfile additionally declares unique CNIC, license and vehicle plate indexes. These are code declarations; their actual database presence was not checked.

Role consistency is enforced through application services, not a MongoDB foreign key: a `ref: User` does not itself enforce existence or the owner's role. The unique owner index enforces at most one document per User in each profile collection; it does not require a profile for every User or prevent a privileged raw write from creating an orphan/wrong-role profile.

Registration passes a fixed Passenger/Driver role to shared onboarding, which rechecks pending, email-verified eligibility inside a transaction and supplies the verified User ID to the profile insert. Admin provisioning creates User and AdminProfile in its existing transaction. Profile schemas do not duplicate email, password hash or role. User excludes passwordHash by default; public DTOs allowlist authentication/profile response fields.

## Access and missing-profile behavior

- Passenger/Driver profile routes use `requireAuth("passenger")` / `requireAuth("driver")`. Onboarding uses the corresponding restricted token and role guard. Owner IDs come from middleware, never from client-selected profile IDs.
- Access middleware verifies token role, current User role/status and authVersion. Passenger and Driver tokens cannot reach the other role's protected routes or Admin routes.
- Admin routes retain `requireAuth("admin")`, current database permission checks for `manageAdmins`, manager-or-self restrictions and existing service-level protections. Standard administrators retain existing operational access; Full Access includes admin management. No permission policy changed.
- Passenger PATCH has a strict field allowlist, one targeted field group per request, trusted owner filters, validation and compare-and-set conflict checks. Contact updates replace one embedded contact or set null.
- Passenger/Driver GET returns 404 if User or profile is missing. Passenger PATCH also returns 404 without creating a profile or changing the account. An old active Passenger can still pass shared login because login checks User identity/state; profile access subsequently returns 404. No backfill, fabricated contact or user deletion was added.
- Admin profile GET currently reads User and pending email-change data; it does not depend on the marker AdminProfile document. This existing behavior was preserved.

Evidence: `src/modules/auth/{user.model,auth.service,auth.middleware}.js`, `src/modules/passenger/passenger.{model,service,validation,routes,controller}.js`, `src/modules/driver/driver.{model,service,routes}.js`, `src/modules/admin/admin.{model,service,routes}.js`.

## Deleted collection, initialization and focused correction

Existing completion already inserts PassengerProfile and activates User in the same `mongoose.connection.transaction` callback. Profile creation failure aborts activation; activation/transaction failure aborts the profile insert. Access-token creation follows the successful transaction. The earlier OTP step deliberately creates a pending User, which remains pending when completion fails.

No `autoCreate` or `autoIndex` override was found in backend source. Installed Mongoose is 9.11.3, with both defaults true (`node_modules/mongoose/lib/mongoose.js`). Its model initialization calls collection creation followed by index creation, and caches the resulting promise (`lib/model.js`, Model.init). The server previously began listening after connection without explicitly awaiting PassengerProfile initialization.

Established integrity gap: registration did not await that initialization and did not check the owner index. Moreover, dropping a collection after model initialization does not reset the cached initialization promise. A later insert can recreate a collection in supported transaction/topology circumstances, but that does not ensure the lost owner index is recreated. A schema's `unique: true` is not a document validator.

Small correction, restricted to Passenger completion:

1. Validate the existing request contract.
2. Await `PassengerProfile.init()` before the existing account/profile transaction.
3. Read `PassengerProfile.listIndexes()` and require the full unique single-field ascending owner index, without sparse/partial scope.
4. Return a generic trusted 503 if initialization/index inspection fails or the constraint is missing. Do not activate the account or insert a profile in that case.

No explicit collection/index repair, `createIndexes`, `syncIndexes`, migration or new schema was added. The new `init()` await synchronizes existing normal Mongoose initialization; normal startup may already create collections/indexes when a backend is connected. That is distinct from this investigation, which never started or connected the backend.

Fresh registration after approved initialization can create one correctly owned profile, with emergencyContact null, and activate its User atomically. The unique owner index should be rebuilt on a fresh backend initialization under the repository's defaults, provided the database grants permission and index creation succeeds. It is not guaranteed restored after a drop in an already initialized process. The new guard rejects unsafe completion instead of pretending otherwise. The metadata call also requires database permission to list indexes.

Limitations: isolated tests simulate database behavior; live transaction support, index creation, privileges and current collection state remain unverified. Administrative collection/index changes must be coordinated outside registrations; a metadata check cannot prevent a privileged operator dropping an index after that check.

Reference behavior: [Mongoose index creation](https://mongoosejs.com/docs/production/indexes.html), [MongoDB transaction operation restrictions](https://www.mongodb.com/docs/v8.0/core/transactions-operations/). The locally installed Mongoose source was inspected for actual version behavior.

## SRS / ERD / physical mapping

| SRS requirement | ERD entity | Mongoose model | Collection / storage | Relationship | Implementation status |
|---|---|---|---|---|---|
| 2.1, 4.1-4.3 common authentication/profile | PASSENGER | User + PassengerProfile | users + passengerprofiles | Profile.user -> User(role=passenger), unique owner | Implemented foundation and aligned design; old profiles missing after reported drop; verification/settings coverage incomplete |
| 4.2, 4.15 driver identity/profile | DRIVER | User + DriverProfile | users + driverprofiles | Profile.user -> User(role=driver), unique owner | Implemented core profile, driver verification and RBAC |
| 4.2, 4.21-4.23 admin identity/access | ADMIN | User + AdminProfile | users + adminprofiles | Profile.user -> User(role=admin), unique owner | Implemented core identity/permissions; all operational SRS functions are not complete |
| 4.3 one emergency contact | EMERGENCY_CONTACT | PassengerProfile embedded schema | passengerprofiles.emergencyContact | Passenger -> zero-or-one contact | Implemented and aligned through embedded storage |
| 4.15, 4.23 approved vehicle | VEHICLE | DriverProfile embedded vehicle schema | driverprofiles.vehicle | Driver -> one current embedded vehicle | Partial: plate/details exist; independent vehicle identity, seating capacity and vehicle verification state are missing; cannot yet meet final trip-assignment contract |
| 1.4 FYP-I, 4.5, 4.24 | ROUTE | None | None | Route -> ordered Stops and Schedules | Missing FYP-I foundation |
| 1.4 FYP-I, 4.5, 4.24 | STOP | None | None | Stop.route_id + stop_order | Missing FYP-I foundation |
| 1.4 FYP-I, 4.5, 4.24 | SCHEDULE | None | None | Schedule.route_id; Schedule -> Trips | Missing FYP-I foundation |
| 1.4 FYP-I, 4.17, 4.24, 4.31 | TRIP | None | None | Trip.schedule_id, approved Driver/Vehicle assignments, future seats | Missing FYP-I foundation |
| 4.6-4.9, 4.18, 4.25, 4.29-4.32 | TRIP_SEAT, BOOKING, WAITLIST_ENTRY, TICKET, BOARDING_RECORD | None | None | Trip seats; Passenger bookings; waitlist offers; ticket/check-in per booking | Planned FYP-II full implementation; SRS also requires booking/seat and QR feasibility proof-of-concept in FYP-I |
| 4.10-4.13, 4.26-4.27, 4.33-4.34 | LOCATION_UPDATE, DEVIATION_ALERT, SOS_ALERT, INCIDENT_REPORT, FEEDBACK | None | None | Trip history/events, Passenger reports/ratings, optional handling Admin | Planned FYP-II full implementation; GPS feasibility proof-of-concept is also FYP-I scope |
| 4.14, 4.20, 4.28 | FAVORITE_ROUTE, NOTIFICATION | None | None | Passenger favorite route; exactly one role recipient per notification | Planned FYP-II persistence |
| 4.23 | VERIFICATION_REVIEW | None | None | Admin reviews exactly one Passenger/Driver/Vehicle | Missing final history model; DriverProfile currently stores latest decision only |
| 4.1-4.2 and implemented recovery/security | Supporting records, outside the 22 business entities | OTP, PassengerRecovery, PasswordResetToken, PasswordResetAttempt | email_otps, passenger_recoveries, passwordresettokens, passwordresetattempts | Registration verification, Passenger recovery, Admin reset tokens, shared recovery throttling | Required support collections |
| Implemented Admin security/account management | Supporting records, outside the 22 business entities | AdminAccessAudit, AdminAccessLock, AdminEmailChange, AdminManagementAudit | adminaccessaudits, adminaccesslocks, adminemailchanges, adminmanagementaudits | Access-change audit/serialization, email verification, management audit | Required support collections |
| 4.35 website and existing contact feature | No dedicated website entity required by ERD | ContactMessage | contactmessages | Website contact submission | Existing implemented support feature; preserve |

The table covers all 22 ERD entities; grouped entries are separate conceptual entities, not completed models. No collections were manufactured to match that number. Four identity/profile collections plus nine operational/support collections remain the 13 active source mappings; embedded EmergencyContact and partial Vehicle add no collection.

`otps` and `passengerrecoveries` still have no current source mapping. Current models explicitly use `email_otps` and `passenger_recoveries`. No live check confirmed that the candidates still exist or that cleanup occurred; no cleanup was attempted.

## Database steps for separate approval — not executed

For the reported incident, the smallest proposed database operation is to establish only `saheli_safar.passengerprofiles` and its declared unique owner index, preserving every User and all other collections.

1. Use an authorized database session to inspect collection existence and index metadata. If a collection has reappeared, check whether its data permits the owner constraint; do not remove documents to resolve a conflict. Back up any extant profile documents/index metadata before manual repair.
2. Obtain explicit approval for creating `saheli_safar.passengerprofiles` if absent and creating its unique `{user:1}` index. Restarting the backend can also trigger these normal Mongoose initialization writes; do not do that as part of this read-only database investigation.
3. Proposed writes, only after that approval and only if needed:

   ```javascript
   const target = db.getSiblingDB("saheli_safar");
   // Only if collection metadata confirmed it is absent:
   target.createCollection("passengerprofiles");
   target.getCollection("passengerprofiles").createIndex(
     { user: 1 }, { unique: true, name: "user_1" }
   );
   ```

4. Verify the full unique index by metadata. If the running model has a cached initialization failure, restart only the intended backend after approval of normal initialization effects. The user may then create a fresh designated account through the actual UI and verify its own profile/contact. No bulk repair of older accounts is proposed.

No legacy collection removal is included in this proposal.

## Changed files and verification

Only this task's changes:

- `backend/src/modules/passenger/passenger.service.js`: await profile initialization and verify the unique owner index before completion; existing earlier profile-editing changes preserved.
- `backend/tests/passenger-registration-integrity.test.js`: 13 isolated tests covering readiness, cached initialization/drop, invalid constraints, metadata failures, transaction ordering/failure simulation, duplicate owner, role restrictions, missing profiles and schema relationships.
- `backend/DB-STRUCTURE-FIX-01-REPORT.md`: reference evidence, mapping, limitations and separately approved database repair proposal.

Executed only:

```text
node --test backend/tests/passenger-registration-integrity.test.js backend/tests/passenger-profile-update.test.js
```

Result: **25 passed, 0 failed** (13 new integrity checks + 12 existing profile checks). These tests use disconnected models, stubbed persistence/transactions and synthetic inputs. No .env, real credentials, database writes, SMTP or real accounts. The existing profile suite's small local HTTP fixture is isolated; no browser suite was run. Syntax checks for the two JavaScript files and focused diff whitespace check passed.

No Admin, Driver, Website, shared auth/recovery, model schema or client code was changed. No database operation, seed, migration, export, Git staging, commit, push, reset, stash or clean was performed.

## Next task and Git status

Recommended next focused implementation: **FYP-I Route/Stop/Schedule/Trip model foundation**, with isolated relationship/index validation and no seed or live writes. First resolve how Trip will reference an independently identifiable approved Vehicle with seating capacity; do not treat the current embedded vehicle fields as the complete ERD VEHICLE implementation. Full booking, QR, GPS and SOS functionality remain outside that task.

Branch `main`, HEAD `fa95aad31f380402998236097289ca9199864daa`. Before this task: 30 modified tracked files, 41 untracked files, zero staged. After this task: 30 modified tracked files, 43 untracked files, zero staged. The Passenger service was already modified by earlier work; this task adds two untracked files and preserves the prior working tree.
