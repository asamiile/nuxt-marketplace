# Nuxt Marketplace

## Nuxt

- Make sure to install dependencies:

```bash
pnpm install
```

- Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

- Build the application for production:

```bash
pnpm build
```

- Locally preview production build:

```bash
pnpm preview
```

## Supabase

### Migration

- Applying the migration file

```bash
supabase link --project-ref [project-ref]
supabase db push
```

- Viewing Migration History

```bash
supabase migration list
```

- Repairing migration history

```bash
supabase migration repair [TIMESTAMP] --status applied
```

### Edge Functions

- Deploy Edge Functions

```
supabase functions deploy product-status-notifier --no-verify-jwt
```