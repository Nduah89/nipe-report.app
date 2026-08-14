# Nipe Report Card r33 Backup Continuity Candidate

Status: development candidate

This branch tracks the school-side acceptance of Report Card Enterprise v7.4.0 r33 backup continuity.

Change:
- The shared scheduled-backup inventory adds `license_upgrade_authorizations` to encrypted full database snapshots.
- The table remains excluded from automatic school restore tables.
- No frontend, config.js, licence, database schema, licence-verifier, or Enterprise entitlement change is required.

Expected Nipe acceptance result:
- Full backup: completed
- Verification: passed
- `row_counts.license_upgrade_authorizations = 0` because central authorization rows are held on the Enterprise master, not the generated school.
- Existing Enterprise School revision 5 entitlement remains unchanged.

Candidate scheduled-backup source SHA-256:
`fe46c1ea7534ea2dfb7a59dfb0c7212cdfad12b70a59f22817b4577d2c31b89b`