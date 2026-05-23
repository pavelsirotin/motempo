# Motempo

Landing page for [motempo.com](https://motempo.com) — logo, tagline, and a contact drawer that opens GitHub Issues.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Contact form (optional locally)

Copy `.env.example` to `.env.local` and set:

- `GITHUB_TOKEN` — personal access token with permission to create issues on the target repo
- `GITHUB_REPO` — `owner/repo` (e.g. `pavelsirotin/motempo-contacts`)

Without these, the form shows a friendly error when you submit.

## Logo

The site uses `public/logo.png` — **white logo on a transparent background** (generated from your source file).

To regenerate after updating the logo:

1. Export from your design tool as **PNG** (black logo on **white** or **transparent** — not black-on-black).
2. Save it as `public/logo-source.png` (or `.jpg`).
3. Run:

```bash
npm run process-logo
```

This creates `public/logo.png` for the site. No CSS filters are applied in the browser.

**Source files:** Full-quality logos live in [`../Motempo/`](../Motempo/) (`Motempo Logo White.png`, `Motempo Logo Black.png`). The site uses the white PNG on the dark background.

To regenerate from the black logo: `npm run process-logo` (reads `public/logo-source.png` or `../Motempo/Motempo Logo Black.png`).

## Deploy to Vercel

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import the repository.
3. Add environment variables: `GITHUB_TOKEN`, `GITHUB_REPO`.
4. Deploy.

## Connect motempo.com (GoDaddy domain + Vercel app)

You keep the domain at GoDaddy; DNS points visitors to Vercel.

1. Vercel → Project → **Settings** → **Domains** → add `motempo.com` and `www.motempo.com`.
2. GoDaddy → **DNS** for motempo.com → add the records Vercel shows (usually an `A` record for the apex and a `CNAME` for `www`).
3. Wait for DNS propagation; SSL is automatic on Vercel.

## GitHub token setup

1. Create a repo for inbound messages (can be private), e.g. `motempo-contacts`.
2. GitHub → **Settings** → **Developer settings** → **Personal access tokens**.
3. Create a token with **Issues: Read and write** on that repo (fine-grained) or `repo` scope (classic, for private repos).
4. Set `GITHUB_REPO=your-username/motempo-contacts` in Vercel and redeploy.

New form submissions appear as issues titled `Contact from motempo.com`.
