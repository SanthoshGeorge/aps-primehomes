# APS PrimeHomes — Property Manager

A small internal web app for the 3 owners of APS PrimeHomes LLC to track properties, tenants,
leases, keys, mortgages, insurance, HOA, utilities, and service contacts — with an automatic
email 60 days before a lease expires.

Built following an AIDLC (AI-Driven Development Lifecycle) process. See `docs/` for the
Requirements, Architecture, and QA phase documents behind this build.

**Stack:** Next.js + Supabase (Postgres + Auth) + Netlify (hosting + scheduled function) +
Brevo (email). Designed to run at **$0/month** — see `docs/02-architecture.md` for why each
piece was chosen.

## One-time setup (do this once, in order)

### 1. Supabase (database + login)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, paste and run the entire contents of `supabase/migrations/0001_init.sql`.
3. Go to **Authentication → Providers → Email** and turn **off** "Allow new users to sign up."
   This is what makes the app invite-only.
4. **For now, invite only yourself**: Go to **Authentication → Users → Invite user** and invite
   `santh.george@gmail.com`. Hold off on Roshan and Jiju until you're done testing — see the
   callout below for why.

   Optionally set your "Raw user meta data" to `{"full_name": "Santhosh George"}` when inviting
   so your display name is right from the start (otherwise it defaults to the part of your email
   before the `@`, and you can fix it later in the app's Settings page).

   > **Why only yourself first:** the daily notification email goes to every row in the
   > `owners` table, and a row is only created when someone accepts a Supabase invite. So as
   > long as Roshan and Jiju haven't been invited yet, it is not possible for a test lease to
   > accidentally email them — even if you trigger the notification function manually while
   > testing (§4 below, and `docs/03-qa-test-plan.md` step 3). Once you've run through the QA
   > checklist yourself and you're ready, come back to this step and invite:
   > - roshan.remanan@gmail.com
   > - jijustephen@gmail.com
   >
   > (same "Raw user meta data" trick works for their names too).
5. Each owner gets an email with a link — it signs them in and sends them to `/update-password`
   to set their own password. That link only works after the app is deployed (step 3 below), so
   owners should wait to click it until you've shared the live URL.
6. Grab these values from **Project Settings → API** — you'll need them in step 3:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this one secret)

### 2. Brevo (email notifications)

1. Create a free account at [brevo.com](https://brevo.com) (no credit card required).
2. Go to **Senders, Domains & Dedicated IPs → Senders → Add a sender**, and verify
   `santh.george@gmail.com` as the sender (a confirmation link, not a domain — no DNS setup
   needed).
3. Go to **Settings → SMTP & API → API Keys** and generate a new API key.

### 3. Deploy

1. Push this folder to a new **private** GitHub repository.
2. In [Netlify](https://netlify.com), click **Add new site → Import an existing project**, pick
   the repo. Netlify will read `netlify.toml` automatically (build command and the
   `@netlify/plugin-nextjs` plugin are already configured).
3. Before the first deploy finishes, add these environment variables under **Site configuration
   → Environment variables**:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase step 1.6 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase step 1.6 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase step 1.6 (keep secret) |
   | `BREVO_API_KEY` | from Brevo step 2.3 |
   | `BREVO_SENDER_EMAIL` | santh.george@gmail.com |
   | `BREVO_SENDER_NAME` | APS PrimeHomes Notifications |

4. Redeploy (or trigger the first deploy) once the env vars are saved.
5. In Supabase, go to **Authentication → URL Configuration** and set the **Site URL** to your
   Netlify URL (e.g. `https://aps-primehomes.netlify.app`) so the invite links point to the live
   site instead of `localhost`.
6. Now have each owner open their invite email and click the link — it'll take them to the live
   site to set a password. From then on they just sign in at your Netlify URL.

### 4. Confirm the daily notification job is running

Netlify → **Functions** tab → `lease-check` shows each day's run and its log output. It runs
once daily and does nothing (silently) unless a lease is within 60 days of its end date — that's
expected, not a bug.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the same values as the Netlify env vars above
npm run dev
```

Open http://localhost:3000. The scheduled function only runs on Netlify — to test it locally,
run `netlify dev` (via the Netlify CLI) or just trigger it manually from the Netlify dashboard
after deploying.

## Adding a property

Sign in → **Add property** → fill in nickname/address → you're dropped onto its detail page,
where you can fill in the tenant/lease, keys, mortgage, insurance, HOA, utilities, and contact
sections independently — each section saves on its own.

## Project structure

See `docs/02-architecture.md` §5 for the full layout and §2 for the data model.
