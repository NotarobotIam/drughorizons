# DrugHorizons account setup

Status: connected to project `rfsnmhcxkhqqpgwxlhfi` (DrugHorizon). The profiles migration has been applied and database isolation tests passed. The account UI is implemented on the feature branch. Public registration is disabled until redirect URLs and email delivery are verified.

1. Create a Supabase account and a project named DrugHorizons. Keep the database password in your password manager.
2. Enable the email/password provider under Authentication. Keep email confirmation enabled.
3. Configure the Auth Site URL as `https://www.drughorizon.com` and allow `https://www.drughorizon.com/account/` as a redirect URL. The account page handles PKCE callbacks and password recovery.
4. The migration `migrations/202611220001_profiles.sql` is already applied to the connected project under migration name `create_private_profiles`. Do not reapply it. It creates a private per-user application profile and an internal signup trigger.
5. `dist/supabase-config.js` contains only the project URL and public publishable key. Never put the database password, secret key, or service_role key into GitHub or browser code.
6. Configure a production email sender before opening public registration; Supabase's default sender has delivery and recipient restrictions.

## Data model

- Supabase Auth: account emails, password hashes, confirmation state, and sessions. Application code must never store plaintext passwords or copy password hashes.
- `public.profiles`: authenticated user ID, display name, creation time. Row-level security restricts users to their own profile. Only display names can be updated by browser clients.
- Existing saved trials remain browser-local. Cross-device saved research is a separate future migration.

Collecting an email to create an account does not subscribe that person to marketing. No mailing list or marketing consent is implemented here.

## Verification before launch

Test signup with email confirmation, login, logout, password recovery, session restoration, and profile isolation between two accounts. Verify anonymous clients cannot read profiles and one signed-in user cannot read or change another user's profile. Test registration email delivery with the configured sender.

References:
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/guides/database/postgres/row-level-security

When email confirmation, redirects, and custom SMTP are verified, set `publicRegistrationEnabled: true` in `dist/supabase-config.js`, rebuild, test, and deploy. Until then, the Create account control stays hidden.

## Verified database checks

Transaction-scoped synthetic users confirmed that the signup trigger creates profiles, a signed-in user sees and updates only their own profile, user IDs cannot be edited through the Data API role, and anonymous profile reads are denied. All fixture changes were rolled back. Supabase security advisors returned no warnings after revoking public execution of the automatically created `rls_auto_enable` helper.

## Launch testing

The owner reports custom SMTP saved and production Site URL/redirect configured. Public registration is enabled for live verification. Confirmation delivery, sign-in, and password recovery still require an owner-run test; do not treat configuration alone as a passed email-delivery test.
