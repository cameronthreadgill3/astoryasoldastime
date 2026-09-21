# A Story As Old As Time

Warm digital storefront for selling downloadable books, PDFs, audio, video, and other media.

**Brand slug:** `astoryasoldastime`  
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · JSON store · optional Stripe + Vercel Blob

## Features

- Public catalog (`/`) and product detail (`/products/[id]`)
- Admin (`/admin`) protected by `ADMIN_PASSWORD` + httpOnly cookie session — create / edit / delete products, upload cover + sellable file, toggle active
- Storage: `@vercel/blob` when `BLOB_READ_WRITE_TOKEN` is set; otherwise files under `public/uploads` (gitignored except `samples/`)
- Checkout: Stripe Checkout when Stripe env vars are present; otherwise **Demo checkout** that creates a purchase + download token with no payment provider
- Tokenized, time-limited downloads via `/api/download/[token]` (does not expose raw paid file paths as the primary access path)
- Success page with download button
- Persistence: JSON under `data/` locally; same JSON documents in Vercel Blob when the Blob token is set (`lib/store.ts`)

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default admin password: `changeme` (change via `ADMIN_PASSWORD`).

### Demo vs Stripe

| Mode | When | Behavior |
|------|------|----------|
| **Demo** | Any of `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` missing | Checkout creates a purchase immediately and redirects to `/success` with a download token |
| **Stripe** | All three Stripe vars set | Checkout creates a Stripe Checkout Session; webhook (or `/api/checkout/confirm`) records the purchase |

Demo mode is intentional so the storefront works on day one without keys.

## Deploy to Vercel

1. Import the GitHub repo `cameronthreadgill3/astoryasoldastime`.
2. Set the Vercel project name to **`astoryasoldastime`** (URL: `https://astoryasoldastime.vercel.app`).
3. Configure environment variables (Production + Preview as needed):

| Variable | Required | Notes |
|----------|----------|-------|
| `ADMIN_PASSWORD` | Yes | Strong password for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Yes in prod | e.g. `https://astoryasoldastime.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Strongly recommended on Vercel | Durable uploads + product/purchase JSON (filesystem is ephemeral on serverless) |
| `STRIPE_SECRET_KEY` | Optional | Live/test secret key |
| `STRIPE_WEBHOOK_SECRET` | Optional | From Stripe webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Publishable key |

4. If using Stripe, add a webhook endpoint: `https://astoryasoldastime.vercel.app/api/webhooks/stripe` for `checkout.session.completed`.
5. Deploy. Seed products ship in `data/products.json` and sample files under `public/uploads/samples/`.

### Serverless note

On Vercel without Blob, runtime writes to `data/` or `public/uploads` will not persist across invocations. For a production seller workflow on the free tier, set `BLOB_READ_WRITE_TOKEN` so `lib/store.ts` and `lib/storage.ts` use Blob.

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Storefront home + catalog |
| `/products/[id]` | Product detail + Buy |
| `/checkout` | Email + pay (Stripe or demo) |
| `/success` | Post-purchase download |
| `/admin` | Seller dashboard |
| `/api/download/[token]` | Protected download |
| `/api/webhooks/stripe` | Stripe webhook |
| `/api/checkout/confirm` | Stripe session → token (success page fallback) |

## Scripts

```bash
npm run dev
npm run build
npm start
```

## License

Private / all rights reserved unless otherwise noted.
