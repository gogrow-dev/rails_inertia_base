# AGENTS.md / CLAUDE.md

This file provides guidance to Coding Agents (like claude.ai/code) when working with code in this repository.

## Stack

Rails 8.1 + Inertia.js + React 19 + TypeScript, from the [Inertia Rails React Starter Kit](https://github.com/inertia-rails/react-starter-kit). PostgreSQL with solid_cache / solid_queue / solid_cable on the primary database. Vite builds from `app/javascript`. shadcn/ui + Tailwind v4. Auth is hand-rolled, Authentication Zero style.

## Commands

```bash
bin/setup                                  # deps, db, then bin/dev
bin/dev                                    # rails + vite (Procfile.dev)
bin/ci                                     # full local pipeline (config/ci.rb)

bin/rspec spec/requests/users_spec.rb:12   # one example; drop :12 for the file
bin/rubocop                                # -a to autocorrect
npm run lint:fix / format:fix / check      # eslint / prettier / tsc

bin/rails typelizer:generate:refresh       # after touching a serializer or route
bundle exec i18n export                    # after editing config/locales
```

## Conventions that will surprise you

**Actions render without `render inertia:`.** Controllers inherit `InertiaController`, which includes `Alba::Inertia::Controller` and overrides `default_render`. The component comes from the controller/action path, and the props come from `{Namespace}::{Controller}{Action}Serializer` — instantiated with `view_assigns`, so **instance variables are the props**. `@sessions = ...` becomes the `sessions` its serializer reads. Do not add `render inertia: { ... }`; that's the plain Inertia Rails pattern, not this one.

A missing page serializer is **silently ignored** — the page renders with only shared props. Empty props almost always means a misnamed serializer.

**Serializers** live in `app/serializers` with a `*Serializer` suffix (not `app/resources`/`*Resource`, which the vendored skills describe). Three kinds: entity (`UserSerializer`), page (one per action), and `SharedPropsSerializer`, injected globally. Never `as_json` — it bypasses type generation.

**Two generated trees are checked in**, from Typelizer: `app/javascript/types/serializers/` and `app/javascript/routes/` (typed route helpers — use them over URL strings). Regenerate and commit; never hand-edit — CI fails if any of them drift. Outside development the generator needs `TYPELIZER=true`, or explicit `typelize` annotations silently degrade to `unknown`. Same for `app/javascript/components/ui/` (shadcn) and `app/javascript/locales/` (i18n export).

**Translations start in Rails.** `config/locales/en.yml` is the source; i18n-js exports it to `app/javascript/locales/en.json`, which i18next reads. Add a key there, not a string in a component. `flash`, `validations` and `user_mailer` are excluded from the export because the server resolves them. i18next is configured for Rails' `%{name}` placeholders, so one syntax works on both sides.

**A brand-new dependency will fail to install.** `Gemfile` sets `cooldown: 7` and `.npmrc` sets `min-release-age=7`, refusing versions published in the last week. The package isn't broken, it's too new — wait, or bypass with `npm install --min-release-age=0`. `engine-strict=true` also hard-fails outside Node >= 24 / npm >= 11.10.

**Auth**: `Current` holds `session` and delegates `user`. `ApplicationController` authenticates every request from a signed cookie; opt out with `skip_before_action :authenticate`. On validation failure, controllers redirect back with `inertia: { errors: @record.errors }` — PRG, not `render`.

**SSR is on** (`ssr_enabled` in `config/initializers/inertia_rails.rb`), served by the `:inertia_ssr` Puma plugin. Production images need `--build-arg SSR_ENABLED=true`.

`VITE_*` variables are compiled into the bundle, so they must be set at build time, not runtime — see the README's deployment section for Kamal and Heroku.

## Frontend

`@/*` → `app/javascript/*`. `entrypoints/inertia.tsx` wraps everything in `PersistentLayout` (flash toasts, locale sync); pages then choose `AppLayout` or `AuthLayout`.

Forms use Inertia's `<Form>` / `useForm`, wired by `name` — never react-hook-form. The React Compiler runs via Babel in `vite.config.ts`, so skip manual memoization.

## Testing

RSpec, request and mailer specs. **Fixtures, not factories** (`fixtures :users`), though factory_bot is available. `sign_in(user)` comes from `spec/support/authentication_helpers.rb`.

Use the `inertia_rails/rspec` matchers (`render_component`, `have_props`, `have_flash`) rather than reading `inertia.props`. After a POST/PATCH/DELETE that redirects, `follow_redirect!` before asserting on props or flash.

## Style

**Comments are the exception, not the habit.** Write one only for a non-obvious *why*, a constraint, or a genuine footgun. Never narrate what the code says, and never put design rationale in a comment — that belongs in the commit message. If a comment is questioned in review, delete it. Leave existing comments alone.

Prefer the smallest idiomatic solution and framework defaults over hand-rolled machinery. Don't extract a constant unless it's genuinely reused across files or names an opaque value — pass enum and inclusion lists straight to the macro. `frozen_string_literal` is cop-enforced, so never hoist a string just to freeze it.

RuboCop inherits `rubocop-rails-omakase` with cops re-enabled in `.rubocop.yml`, two of them against omakase's intent: indentation is `normal` (methods after `private` are *not* extra-indented), and `Style/StringLiterals` covers every file, not just `test/`.

Declaration order — models: constants → attr macros → enums → associations → validations → callbacks → scopes. Serializers: `typelize_from` → attributes → typed attributes → associations, each `typelize` directly above what it types. Components: imports (let `lint:fix` sort them) → props interface → default export.

## Pull requests

Title: `[ISSUE-ID] Short description`. Use the real ticket key or drop the brackets entirely — never a placeholder. Body is exactly two sections:

```markdown
### Summary
Two or three sentences on what this does and why.

### Changes
- One bullet per meaningful change
```

Plain English, active voice, no throat-clearing or filler adjectives. `gh pr create --body` bypasses `.github/pull_request_template.md`, so write the body out in full.

## Skills

`.claude/skills/` vendors the [inertia-rails/skills](https://github.com/inertia-rails/skills) set; load `inertia-rails-architecture` first for any new page or feature. Where they conflict, `alba-inertia` wins — with the naming caveat above.
