# Nipe r34 Storage Guard Acceptance

**Date:** 14 August 2026  
**Status:** PASS

Nipe received the r34 Free Plan Storage Guard operational hardening without changing the school frontend, database schema, or signed licence.

## Accepted runtime

- `scheduled-backup`: v12
- packed Edge bundle SHA-256: `2eeaa759f849446d2494fd0c155118caa6c2424c60025f87925c7a91e755158a`
- canonical r34 TypeScript source SHA-256: `fd56a61a330e323083427467b9ff17f8e055d747a33d8da539718c74c99e062a`
- runtime JavaScript SHA-256: `e75b0da8182a7bc813673b680c1b8d05ca7bf41b2930102a8c76d868821a5e95`

Live `storage_maintenance` returned HTTP 200. The latest full backup `590d15a6-7f86-49f5-a004-99e4e81b8aba` was then re-verified through the r34 runtime and passed:
- database decrypted/decompressed and identity-bound,
- row counts verified,
- 17 protected Storage objects verified,
- 29,615,473 protected Storage bytes checksum-verified,
- `license_upgrade_authorizations` row count = 0.

## Cleanup

Redundant unreferenced backup payloads and terminal/orphan restore-upload ZIPs were removed through the Supabase Storage API. Recovery-test and restore-job referenced backups were retained.

Current `restore-imports` object count: 0.

Retention is now:
- 7 days
- minimum 2 copies

A daily `rce-storage-maintenance` cron runs at 03:45 using Vault-resolved credentials.

## Final measured Nipe Storage

- `system-backups`: 159,202,227 bytes
- `report-pdfs`: 22,108,057 bytes
- `school-branding`: 6,231,502 bytes
- `report-card-templates`: 1,107,998 bytes
- `headteacher-signatures`: 101,150 bytes
- `staff-photos`: 66,766 bytes
- total: 188,817,700 bytes

All school-content buckets were preserved.

## Licence invariant

Nipe remains:
- Enterprise School
- active
- signed revision 5
- licence reference `RCE-N-001-D9D2FFB5EA47-R1`
- entitlement hash `8d19b12f743e397c095c9025a3430823968f4c2068655d005604e0c04c066b82`
- package id `0445423a-34d5-421b-9f84-3d255d0c2fdd`
- installation id `4ad797c0-5b99-484f-ba93-30581945f838`
- project `gmbchwvvdwulolgtsnfs`
- tenant `N-001`
- signature verified
- authority active
- exactly one legitimate activation-code plan-upgrade event
