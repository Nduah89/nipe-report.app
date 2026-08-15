# Nipe International School — Edusentia v7.4.0 r37 Final Product-Ready Visual Release

**Release disposition:** Production Accepted, Final Security Seal Pending

## Production changes

- Added the final Edusentia academic-operations login background asset while preserving Nipe school identity.
- Added an isolated `r37-final-ui.css` presentation layer; authentication JavaScript and form semantics were not changed.
- Activated the new login visual layer in `index.html`.
- Advanced the installation-scoped service-worker cache generation and included the new visual assets in the static cache.
- Hardened `notification-dispatcher` so email transport configuration is validated before notification jobs are claimed, preventing configuration outages from consuming retry budgets.

## Verification completed

- Nipe Supabase project status: ACTIVE_HEALTHY.
- Latest full backup remains completed, encrypted and verification-passed with the stored-object integrity snapshot retained.
- Live licence remains active, authority-active and signature-verified with the accepted package, tenant, project, installation and licence reference bindings unchanged.
- Authorized domain binding still includes `nduah89.github.io`.
- Client error events in the preceding 24 hours: 0.
- Scheduled notification cron runs reviewed with no failures.
- Historical notification jobs that previously exhausted retries because the optional email sender was not configured were preserved for audit rather than deleted or silently rewritten.
- New dispatcher hardening prevents future transport-configuration outages from consuming retry budgets before configuration is available.
- Storage activity reviewed without current production storage errors.

## Rollback point

Pre-visual-release Nipe baseline commit: `fdf8b4b43946790cb413294455e004ebf00ef1a8`.

## Known governance / optional integration items

External application email delivery remains optional and requires a configured `RESEND_API_KEY` plus verified `RCE_EMAIL_FROM`/legacy `NIS_EMAIL_FROM`. The dispatcher now fails safe before claiming jobs when that transport is unavailable.

The release remains **Final Security Seal Pending** because GitHub `main` branch protection is not enabled through the currently available repository administration tooling and Supabase leaked-password protection is unavailable on the current Free plan. These are governance/platform controls, not core academic runtime failures.

No secret values are recorded in this document.
