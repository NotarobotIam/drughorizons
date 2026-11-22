# DrugHorizons account setup

Status: prepared schema only. No Supabase project is connected and live login has not been enabled.

1. Create a Supabase account and a project named DrugHorizons. Keep the database password in your password manager.
2. Enable the email/password provider under Authentication. Keep email confirmation enabled.
3. Configure the Auth Site URL as `https://www.drughorizon.com` and allow `https://www.drughorizon.com/account/` as a redirect URL. The account page will be implemented when the connection is configured.
4. Apply `migrations/202611220001_profiles.sql` once through a migration tool or the project's SQL editor. It creates a private per-user application profile and a signup trigger.
5. Provide the Project URL and public publishable key for browser integration. Never put the database password, secret key, or service_role key into GitHub or browser code.
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
