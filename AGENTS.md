# AGENTS.md / CLAUDE.md

This file provides guidance to Coding Agents (like claude.ai/code) when working with code in this repository.

## Stack

Rails 8.1 + Inertia.js + React 19 + TypeScript, bootstrapped from the [Inertia Rails React Starter Kit](https://github.com/inertia-rails/react-starter-kit). SQLite for all environments (plus separate cache/queue/cable databases via solid_cache / solid_queue / solid_cable). Vite (`rails_vite` + `rails-vite-plugin`) builds assets from `app/javascript`. Auth is Authentication Zero–style, hand-rolled in-app. shadcn/ui (new-york, neutral, lucide) + Tailwind v4.

## Commands

```bash
bin/setup                  # install deps, prepare db, then exec bin/dev
bin/dev                    # Procfile.dev: rails server + vite (overmind/hivemind/foreman)
bin/ci                     # full local CI pipeline (see config/ci.rb)

bin/rspec                                  # all specs
bin/rspec spec/requests/users_spec.rb      # one file
bin/rspec spec/requests/users_spec.rb:12   # one example by line
bin/rails db:test:prepare spec             # what CI runs

bin/rubocop                # rubocop-rails-omakase style
npm run lint / lint:fix    # eslint over app/javascript + root config files
npm run format / format:fix# prettier (no semicolons, 80 cols, tailwind class sorting)
npm run check              # tsc on tsconfig.app.json + tsconfig.node.json
bin/brakeman / bin/bundler-audit
```

**After changing any serializer or route, regenerate the TypeScript:**

```bash
bin/rails typelizer:generate:refresh
```

CI fails if `app/javascript/routes` or `app/javascript/types/serializers` drift from the Ruby source, so commit the regenerated files.

### Dependencies

Both package managers enforce a 7-day supply-chain cooldown — `cooldown: 7` on the `Gemfile` source and `min-release-age=7` in `.npmrc`. A version published less than a week ago will not resolve, so adding a brand-new gem or package fails to install. The dependency isn't broken, it's just too new: wait it out, or bypass deliberately with `npm install --min-release-age=0`, or by temporarily dropping the `cooldown:` option.

`.npmrc` also sets `engine-strict=true`, so `npm install` hard-fails unless Node and npm satisfy `engines` in `package.json` (Node >= 24, npm >= 11.10 — that npm floor is what `min-release-age` requires).

## Architecture

### The alba-inertia convention (most important thing to know)

Controllers inherit from `InertiaController` (set as `config.parent_controller` in `config/initializers/inertia_rails.rb`), which includes `Alba::Inertia::Controller`. That gem overrides `default_render`, so **an action with no explicit render still renders an Inertia page** — no `render inertia:` call needed:

1. Component name is derived from controller/action → `app/javascript/pages/<controller_path>/<action>.tsx`.
2. Props come from a serializer named `{Namespace}::{ControllerName}{Action}Serializer` (falls back from `...Resource`), e.g. `Settings::SessionsController#index` → `Settings::SessionsIndexSerializer`, `Identity::PasswordResetsController#edit` → `Identity::PasswordResetsEditSerializer`.
3. **Instance variables ARE the props source.** The page serializer is instantiated with `view_assigns`, so `@sessions = ...` in the action becomes the `sessions` the serializer reads. This is the opposite of the plain Inertia Rails pattern — do not add `render inertia: { ... }` here.
4. A missing page serializer is silently ignored (`on_missing_serializer` defaults to `:ignore`) and the page renders with only shared props. If a page's props are mysteriously empty, the serializer name is probably wrong.

Serializers live in `app/serializers` (not `app/resources`) and use the `*Serializer` suffix. Three kinds:

- **Entity** — reusable shapes: `UserSerializer`, `SessionSerializer`.
- **Page** — one per controller action, wires instance variables to props: `Settings::SessionsIndexSerializer`.
- **Shared** — `SharedPropsSerializer`, injected globally by `InertiaController`'s `inertia_share`; sources `Current` and nests `AuthSerializer` (user + session).

All inherit `ApplicationSerializer`, which mixes in `Typelizer::DSL` (`typelize`, `typelize_from`) and `Alba::Inertia::Resource` (per-attribute `inertia:` options like defer/merge). Never use `as_json` for props — it bypasses type generation.

### Ruby → TypeScript generation

Typelizer (`config/initializers/typelizer.rb`) generates two trees, both checked in and both CI-verified:

- `app/javascript/types/serializers/` — interfaces from the Alba serializers, re-exported through `app/javascript/types/index.ts`.
- `app/javascript/routes/` — typed route helpers per controller (`import { dashboard, settingsSessions } from "@/routes"`, used as `dashboard.index().url`). Prefer these over hand-written URL strings.

`app/javascript/types/globals.d.ts` augments `@inertiajs/core`'s `InertiaConfig` so `usePage().props`, `flash`, and `errors` are typed (`SharedProps`, `FlashData`, `string[]`). Add new shared props to `SharedPropsSerializer`, regenerate, and the types flow through.

### Frontend layout

`@/*` aliases `app/javascript/*`. Entry point `app/javascript/entrypoints/inertia.tsx` sets a global `layout` of `PersistentLayout` (mounts the sonner `<Toaster />` and `useFlash`, which turns Rails `flash[:notice]`/`flash[:alert]` into toasts). Pages then wrap themselves in `AppLayout` (sidebar shell) or `AuthLayout`; `layouts/app/` and `layouts/auth/` hold interchangeable templates. `components/ui/` is shadcn-generated — regenerate rather than hand-editing where possible.

Forms use Inertia's `<Form>` / `useForm` wired by `name` attribute — never react-hook-form. The React Compiler runs via a Babel plugin in `vite.config.ts`, so avoid manual memoization.

### Auth

`Current` (`ActiveSupport::CurrentAttributes`) holds `session`, `user_agent`, `ip_address` and delegates `user` to the session. `ApplicationController` authenticates every request from the signed, httponly `session_token` cookie; opt out with `skip_before_action :authenticate` plus `before_action :require_no_authentication` for sign-in/sign-up style actions. Password resets and email verification use `generates_token_for` on `User`. Changing a password wipes other sessions (`after_update` hook in `User`).

Controllers follow the Rails PRG pattern: on failure `redirect_to <same page>, inertia: { errors: @record.errors }` (with `always_include_errors_hash = true` set globally), not `render`.

### SSR

`ssr_enabled = true` in `config/initializers/inertia_rails.rb`; the Puma plugin `:inertia_ssr` runs the Node renderer in-process. In development Vite serves SSR with HMR, so flipping the flag is enough. Production images need `--build-arg SSR_ENABLED=true` (see README and `config/deploy.yml`). Inertia falls back to client rendering on SSR error.

## Testing

RSpec (`spec/`), request specs + mailer specs. Fixtures, not factories — `spec/fixtures/users.yml`, loaded per-spec with `fixtures :users`. `spec/support/authentication_helpers.rb` provides `sign_in(user)` / `sign_out` for `:request` and `:system` specs by minting a real `Session` and signing the cookie.

For Inertia assertions use the `inertia_rails/rspec` matchers (`render_component`, `have_props`, `have_flash`) rather than reading `inertia.props` directly, and after a POST/PATCH/DELETE that redirects, call `follow_redirect!` before asserting on props or flash.

## Skills

`.claude/skills/` (mirrored in `.agents/skills/`, pinned by `skills-lock.json`) vendors the [inertia-rails/skills](https://github.com/inertia-rails/skills) set: `inertia-rails-architecture` (load first for any new page/feature), plus `alba-inertia`, `-controllers`, `-forms`, `-pages`, `-testing`, `-typescript`, and `shadcn-inertia`. The `alba-inertia` skill's conventions win over the generic `render inertia: { ... }` guidance in the others — with the local caveat that this repo names things `*Serializer` in `app/serializers`, not `*Resource` in `app/resources`.

## Pull Requests

### Title

```
[ISSUE-ID] Short description of what changed
```

The issue ID is the ticket key from the task management system (Linear, Jira — e.g. `[ENG-412]`). Drop the bracketed prefix entirely when there is no ticket; never invent one, and never leave a placeholder like `[ISSUE-ID]` or `[NO-TICKET]` in the title.

### Description

Exactly these two sections, in this order:

```markdown
### Summary

Two or three sentences on what this does and why.

### Changes

- One bullet per meaningful change
- Group related edits into a single bullet rather than listing every file
```

`.github/pull_request_template.md` holds this skeleton for the GitHub web UI. **Opening a PR with `gh pr create --body "..."` bypasses that template**, so the body has to be written out in full — the template is not a fallback.

### Writing

Plain English. Short sentences, everyday words, active voice.

Say what changed and why someone reading it later would care. Skip the throat-clearing ("This PR aims to...", "In order to facilitate..."), the filler adjectives ("comprehensive", "robust", "seamless"), and the restating of the diff — a reviewer can read the diff. If a change needs a caveat or a follow-up, say so directly.

The same bar as code comments: if a sentence doesn't tell the reader something the diff can't, cut it.

## Code Style

### RuboCop

`bin/rubocop` inherits `rubocop-rails-omakase`, but `.rubocop.yml` re-enables several cops the gem ships disabled. Two of them diverge from omakase's intent, so don't infer house style from the gem's defaults:

- `Layout/IndentationConsistency` is set to `normal`, **not** omakase's `indented_internal_methods`. Methods after `private` sit at the same indent level as every other method.
- `Style/StringLiterals` is widened to `Include: [ "**/*" ]`. Omakase scopes it to `test/**/*`, which doesn't exist in this RSpec repo, so `spec/` and `db/` went unchecked.

### Comments

**The default is no comment.** Most code you write should ship with zero comments — clear names and small methods carry the intent. A comment is the exception you justify, not the habit you fall into. This applies to all code you add or change — Ruby, `.ts`, `.tsx`, config — in any file, new or existing, not just new files.

- A comment **adds value** only when it explains what the code cannot: a non-obvious _why_, a subtle constraint or footgun, or genuinely complex logic whose intent isn't clear from reading it. These are rare. Keep them.
- A comment is **noise** when it restates what the code already says — narrating a method name, an obvious operation, a class/file/component's purpose, or design rationale that belongs in the PR description or commit message. Never write these. This is the failure mode to watch for: do not annotate each step, section, or block of a method or component.
- When in doubt, leave it out. If a comment is questioned in review, remove it rather than defend it.
- **Leave existing comments alone** — don't strip them as part of unrelated work. This rule governs what you add, not what's already there.

The codebase already reflects this: ~5 comments across 27 Ruby files in `app/`, ~8 across all hand-written TypeScript. The ones that survive are the justified kind — the React `StrictMode` double-fire workaround in `use-flash.tsx`, the React 19 CJS externalization note in `vite.config.ts`, the non-Inertia-page `catch` in `inertia.tsx`. Match that bar.

Same spirit applies to specs and implementation: smallest idiomatic solution, lean on gem/framework defaults, no hand-rolled machinery. Don't add explanatory comments to specs either — `describe`/`context`/`it` strings already say what's under test.

**Generated and vendored trees are exempt from all of this** — never hand-edit or annotate `app/javascript/routes/`, `app/javascript/types/serializers/` (regenerate with `bin/rails typelizer:generate:refresh`) or `app/javascript/components/ui/` (re-add via shadcn). ESLint already ignores all three.

### Constants

Don't reach for a named constant when a direct value is clear enough. The trigger for extracting one is **genuine reuse across files** — another model, serializer, service, or scope needing the same value — or an **opaque magic value** a name makes clear (`DEFAULT_FUTURE_WINDOW_DAYS = 14`). A value used in exactly one place usually shouldn't be a constant.

**Prefer the Rails idiom over a constant for enums and inclusion lists.** Pass the values straight to the macro — the macro is the source of truth:

```ruby
enum :sync_status, { pending: "pending", syncing: "syncing", success: "success" }, default: "pending"
validates :status, inclusion: { in: %w[confirmed tentative cancelled] }
```

Only hoist that list into a constant when something _outside_ the model also uses it — including the frontend: a list that has to reach React should travel as a serialized prop, not be duplicated as a TypeScript union by hand.

A constant referenced only by its own `enum`/`validates` line — or only echoed back in its own spec — is needless indirection; inline it.

**Don't extract a constant just to freeze a value.** `rubocop-rails-omakase` ships `Style/FrozenStringLiteralComment` disabled, so `.rubocop.yml` re-enables it explicitly — `# frozen_string_literal: true` is enforced repo-wide by `bin/rubocop`, and therefore by `bin/ci`. Every Ruby file in the repo carries it, so string literals are already frozen and hoisting `"foo"` into a constant buys nothing on that front. The `.freeze` that matters is on **array/hash** constants, and you only add it once you've already decided the collection is a shared constant for the reasons above.

The TypeScript analogue: don't hoist single-use values either. Module-scope `const breadcrumbs: BreadcrumbItem[] = [...]` in a page is the established idiom — it's referenced by both the layout and `<Head title>` — but a one-off string or class list belongs inline. For shadcn components the `cva` variant map is the source of truth; don't mirror variant names into a separate union.

### Model Element Order

Order declarations inside a model top-to-bottom as:

```
constants → attr macros → enums → associations → validations → callbacks → scopes → other macros
```

Public/private methods follow after the macros. When adding to an existing model, slot new declarations into their group rather than appending at the bottom. `User` follows this — note `has_secure_password` and `generates_token_for` sit with the attr macros, above the associations.

### Serializer Element Order

Same principle for `app/serializers`:

```
typelize_from → attributes → typed custom attributes → associations (one/has_many)
```

Put each `typelize` immediately above the `attribute` block it types (see `UserSerializer`), or use the hash form (`typelize email: :string, sid: :string?`) when annotating a plain `attributes` list.

### Page Component Order

Imports (ESLint's `import/order` sorts and groups these — run `npm run lint:fix` rather than hand-sorting) → module-scope constants like `breadcrumbs` → props `interface` → the default-exported component. Type-only imports must use `import type` (enforced). Props types should come from the generated serializer types via `@/types`, not be re-declared by hand.
