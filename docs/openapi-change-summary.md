# OpenAPI Change Summary

Date: 2025-11-26

Summary of changes to `docs/openapi.yaml` in this patch:

- Added new fields to `components.schemas.Booking`:
  - `refundAmount` (number, nullable)
  - `paymentId` (string, nullable)
  - `adminNotes` (string, nullable)
  - `seatAssignments` (array of objects: `{ seat, guestName }`, nullable)
  - `internalFlags` (object of boolean flags, nullable)

- Added/updated examples:
  - `components.examples.BookingExample` — now includes payment/admin fields and seatAssignment example.
  - `components.examples.PaginatedBookings` — example items updated to include the new fields.

- Responses updated to reference the explicit booking types:
  - Single booking responses now use `#/components/responses/Booking`.
  - List endpoints use `#/components/responses/PaginatedBookings`.

- Rationale:
  - Makes responses explicit for SDK generation and frontend typing; reduces drift between backend controller outputs and the documented contract.

Files changed:
- `docs/openapi.yaml`
- `docs/SYSTEM_PROGRESS_LOG.md`
- `frontend/src/types/openapi.d.ts` (generated types for reviewers/devs)

Notes for reviewers:
- Spectral lint was run locally against `docs/openapi.yaml` using the project's ruleset; result: "No results with a severity of 'error' found!".
- If you want a raw patch, the git diff can be produced locally via:

```powershell
# show compact diff for openapi.yaml
git --no-pager diff --unified=0 HEAD~1 HEAD -- docs/openapi.yaml
```

Next suggested actions:
- Merge into `main` after review and run the project test suite/CI to ensure runtime compatibility.
- If any controller includes additional booking fields not yet documented, request an update and I will add them.
