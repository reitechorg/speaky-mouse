# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Speaky Mouse is an open-source localization management platform for developers and translators. It is currently in prototype stage — functional but incomplete, with the admin UI lacking many features and some functionality only accessible via API or direct database manipulation.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

Database:
```bash
npx prisma migrate dev    # Run migrations
npx prisma generate       # Regenerate Prisma client after schema changes
```

Docker:
```bash
docker compose up         # Start MariaDB + PhpMyAdmin
```

## Architecture

### Next.js App Router Structure

- **`app/(main-layout)/`** — Main public/user-facing pages (home, project overview, translation editor)
- **`app/admin/`** — Admin dashboard (requires admin role)
- **`app/auth/`** — Authentication pages (login)
- **`app/edit/[sourceFileId]/[targetLang]/`** — Translation editor
- **`app/setup/`** — First-run setup to create the initial admin user
- **`app/api/`** — REST API routes (source files, import/export, auth, tokens)
- **`app/ui/`** — Shared UI components

### Core Library (`lib/`)

- **`auth.ts`** / **`auth-config.ts`** — Better Auth instance with 20+ OAuth providers; custom OAuth providers can be added via environment variables following the `AUTH_<PROVIDER>_*` pattern
- **`db.ts`** — Prisma Client singleton
- **`file-handlers/`** — Pluggable import/export system; currently supports JSON (with nested key flattening using `|` separator) and Unity CSV
- **`permissions/`** — RBAC system; project roles are TRANSLATOR → REVIEWER → MODERATOR → ADMIN → OWNER (+ BANNED); site-level roles are user and admin
- **`lang-codes.ts`** — Language code utilities (ISO 639-1/2 and locale codes)
- **`utils/key-encode.ts`** — Encode/decode nested JSON keys using `|` as separator

### Database (Prisma + MySQL)

Schema is split into three model files under `prisma/models/`:
- **`user.prisma`** — User, Session, Account, Verification (Better Auth managed)
- **`project.prisma`** — Project, ProjectMember (roles), ProjectApiKey (READ_ONLY / READ_WRITE)
- **`locale.prisma`** — SourceFile, LocaleString (translation keys), Translation (translated content with approval workflow), Labels

Generated Prisma client lives in `lib/generated/prisma/`.

### Internationalization

UI is localized via **next-intl**. Language files are JSON in `i18n/lang/`. Source locale is English (`en`). The next-intl plugin is configured in `next.config.ts`.

## Key Environment Variables

See `.env.example`. The most important ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `AUTH_SECRET` | Session secret (generate with `npx auth secret`) |
| `DISABLE_PASSWORD_LOGIN` | Set to disable email/password login |
| `AUTH_<PROVIDER>_ID` / `AUTH_<PROVIDER>_SECRET` | Standard OAuth provider credentials |
| `AUTH_CUSTOM_PROVIDERS` | Comma-separated list of custom OAuth provider names |

Custom OAuth providers also support `AUTH_<PROVIDER>_DISCOVERY_URL`, `AUTH_<PROVIDER>_MAP_*` field mappings, and visual overrides (`AUTH_<PROVIDER>_TITLE`, `AUTH_<PROVIDER>_ICON_URL`).

## CLI Tool (`speaky-cli`)

The companion CLI lives at `D:\Dokumenty\Programovani\Projekty\speaky-cli` (separate repository). Developers use it to push source files to the server and pull translated files back.

### CLI Commands

```bash
speaky-cli push   # Upload source files to the server
speaky-cli pull   # Download translated files from the server
```

Build the CLI:
```bash
npm run build     # Compile TypeScript to lib/
npm run cli       # Build and run
```

### speaky.yaml Configuration

Projects configure the CLI via `speaky.yaml` in the project root (there is one in this repo for testing):

```yaml
url: http://localhost:3000        # Server base URL
token: 'your-api-token'          # Project API key (READ_WRITE for push)
files:
  - title: 'My File'
    source: '/path/to/source.csv' # Local path to upload
    target: '/path/to/export.csv' # Server export path template
    parser: 'UnityCsv'            # or 'Json'
    notTranslatedStringExportMode: KEEP_ORIGINAL  # KEEP_ORIGINAL | EMPTY_STRING | SKIP_STRING | FAIL_EXPORT
    sourceLanguage: 'en'
    targetLanguages: ['cs', 'de']
```

Values can reference environment variables with the `ENV:VAR_NAME` prefix (e.g., `token: 'ENV:SPEAKY_TOKEN'`).

### API Endpoints the CLI Uses

| Endpoint | Purpose |
|---|---|
| `GET /api/tokens/self` | Validate token, get project info |
| `GET /api/projects/{projectId}/sourcefiles` | List existing source files |
| `POST /api/sourcefiles` | Create a new source file |
| `POST /api/sourcefiles/{id}` | Update source file metadata |
| `POST /api/sourcefiles/{id}/import` | Upload source file content |
| `GET /api/sourcefiles/{id}/export` | Download translated file |

Authentication is via `Authorization: Bearer {token}` on every request. Tokens are `ProjectApiKey` records in the database with `READ_ONLY` or `READ_WRITE` access; push requires `READ_WRITE`.

## Adding a File Handler

Implement the `FileHandler` interface from `lib/file-handler.ts`, then register it in `lib/file-handlers/get-handler.ts`.

## Deployment

CI/CD via GitHub Actions (`.github/workflows/deploy.yaml`) builds a multi-platform Docker image and pushes to GitHub Container Registry on push to `main`. The Next.js build uses `output: "standalone"` for Docker compatibility.
