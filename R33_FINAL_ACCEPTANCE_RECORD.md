# Nipe r33 Final Acceptance Record

**Release:** Report Card Enterprise v7.4.0 r33 Backup Upgrade Authorization Ledger Continuity  
**Acceptance date:** 14 August 2026  
**Status:** ACCEPTED / PRODUCTION

## Live backup acceptance

- `scheduled-backup` accepted version: 10
- Runtime bundle SHA-256: `cda67f7b438e4751475e020441c047a177e6bcb250891f1d58dfa32c7926056c`
- Fresh live backup: `590d15a6-7f86-49f5-a004-99e4e81b8aba`
- Backup status: completed
- Integrity verification: passed
- `row_counts.license_upgrade_authorizations`: 0
- Protected Storage verification: 17 objects, 29,615,473 bytes
- Completed: `2026-08-14T16:52:01.984Z`
- Verified: `2026-08-14T16:52:27.570Z`

The zero ledger count is correct because central one-time upgrade authorizations are held on the Enterprise master, while the shared schema remains backup-compatible on the generated school.

## Licence regression check

Nipe remains Enterprise School, signed revision 5, active, signature verified and authority active. Entitlement SHA-256 remains:

`8d19b12f743e397c095c9025a3430823968f4c2068655d005604e0c04c066b82`

Exactly one completed `activation_code_plan_upgrade` event remains. No licence identity, deployment binding, expiry, grace period, or school data was modified by r33.

## Final decision

**Nipe has passed the r33 backup-continuity production acceptance gate.**
