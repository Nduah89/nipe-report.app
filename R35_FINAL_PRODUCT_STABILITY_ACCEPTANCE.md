# Nipe r35 Final Product Stability Acceptance

Date: 14 August 2026

## Database and runtime

- `terms.term_reopening_after_end_chk` is validated.
- `can_manage_headteachers()` is not executable by anon/PUBLIC; authenticated and service_role access is preserved.
- Redundant `report_card_templates_storage_path_uidx` was removed; the constraint-backed unique index remains.
- 0 invalid public indexes.
- 0 unvalidated public constraints.
- 0 disabled user triggers.
- 0 active restore jobs at the acceptance gate.
- 0 open package reconciliations at the acceptance gate.
- Scheduled-backup v12 is ACTIVE using the accepted r35/r34 storage-guard runtime bundle SHA-256 `2eeaa759f849446d2494fd0c155118caa6c2424c60025f87925c7a91e755158a`.
- Backup retention is 7 days / minimum 2 copies.
- Daily backup remains 02:15 and daily school Storage maintenance remains 03:45 Ghana time.

## Final recovery point

Backup `59791cbc-26a9-4401-9e76-d3b369f99937` completed and passed the full integrity rehearsal. Database decrypt/decompress, identity binding and row-count verification passed. All 17 protected Storage objects totaling 29,615,473 bytes were decrypted and checksum-verified. Local `license_upgrade_authorizations` row count is 0, as expected for the school project.

## Licence invariant

Nipe remains:
- Enterprise School
- status active
- signed revision 5
- licence reference `RCE-N-001-D9D2FFB5EA47-R1`
- entitlement hash `8d19b12f743e397c095c9025a3430823968f4c2068655d005604e0c04c066b82`
- package ID `0445423a-34d5-421b-9f84-3d255d0c2fdd`
- installation ID `4ad797c0-5b99-484f-ba93-30581945f838`
- project ref `gmbchwvvdwulolgtsnfs`
- tenant `N-001`
- signature verified
- authority active
- expiry 2 August 2028
- exactly one legitimate `activation_code_plan_upgrade` event

No entitlement, binding or licence-term field was changed by r35.

The authoritative product source for the r35 scheduled-backup runtime is frozen in the Enterprise Master r35 final-product-stability branch; this Nipe branch records the deployed school acceptance state.
