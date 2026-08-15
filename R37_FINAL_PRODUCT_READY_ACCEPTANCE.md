# Nipe International School - Edusentia v7.4.0 r37 Product Ready

## Visible identity

- School: **Nipe International School**
- Platform: **Edusentia School**
- Provider attribution: **Powered by Edusentia**
- School crest/logo remains the primary institutional mark.
- Edusentia provider mark is included as a secondary technology identity.

## Live hardening

- Notification dispatcher upgraded to constant-time cron-secret authentication and Edusentia-safe default messaging.
- Scheduled backup, backup verification and notification cron commands resolve `rce_project_url` and `rce_cron_secret` dynamically from Supabase Vault at execution time.
- Obsolete Nipe release probes/triggers were retired to JWT-protected `410 Gone` stubs.
- r37 service-worker cache generation includes the Edusentia provider assets while retaining legacy `RCE`/`NIS` sync tags for compatibility.

## Licence invariant

The existing signed Enterprise School licence remains unchanged:

- Licence reference: `RCE-N-001-D9D2FFB5EA47-R1`
- Plan: Enterprise School
- Signed revision: 5
- Entitlement hash: `8d19b12f743e397c095c9025a3430823968f4c2068655d005604e0c04c066b82`
- Package ID: `0445423a-34d5-421b-9f84-3d255d0c2fdd`
- Installation ID: `4ad797c0-5b99-484f-ba93-30581945f838`
- Project ref: `gmbchwvvdwulolgtsnfs`
- Tenant: `N-001`
- Signature: verified
- Authority: active

Internal `RCE` identifiers are signed compatibility contracts and are intentionally not renamed by r37.
