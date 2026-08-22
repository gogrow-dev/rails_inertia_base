# README

A modern full-stack starter application with Rails backend and React frontend using Inertia.js. Bootstrapped from the [Inertia Rails React Starter Kit](https://github.com/inertia-rails/react-starter-kit).

## Features

- [Inertia Rails](https://inertia-rails.dev) & [Vite Rails](https://vite-ruby.netlify.app) setup
- [React](https://react.dev) frontend with TypeScript & [shadcn/ui](https://ui.shadcn.com) component library
- User authentication system (based on [Authentication Zero](https://github.com/lazaronixon/authentication-zero))
- [Kamal](https://kamal-deploy.org/) for deployment (if needed)
- Optional SSR support

## Setup

1. Clone this repository
2. Setup dependencies & run the server:

```bash
bin/setup
```

3. Open http://localhost:3000

## Enabling SSR

This repository ships SSR-ready turned on. The Puma plugin ([`plugin :inertia_ssr`](config/puma.rb)) manages the Node.js renderer in-process — no separate accessory required.

To turn SSR on/off, flip two switches:

1. Set `config.ssr_enabled = true` in [`config/initializers/inertia_rails.rb`](config/initializers/inertia_rails.rb).
2. Build the image with `SSR_ENABLED=true` (or false) so the SSR bundle ships alongside the app. Two ways:

**With Kamal** — add to [`config/deploy.yml`](config/deploy.yml):

```yml
builder:
  args:
    SSR_ENABLED: true
```

**By hand** — pass the build arg directly:

```bash
docker build --build-arg SSR_ENABLED=true -t react_starter_kit .
```

That's it. Puma boots the SSR process automatically when `ssr_enabled` is true, and Inertia falls back to client-side rendering if it ever fails (see `config.on_ssr_error`).

In development, flipping `ssr_enabled` is enough — Vite serves SSR via its own dev endpoint with HMR. The Docker build arg only matters for production images.

## Deployment

Kamal ([`config/deploy.yml`](config/deploy.yml)) and Heroku ([`Procfile`](Procfile)) are both supported. Either way, note that **`VITE_*` variables are baked into the JS bundle when it is compiled** — setting them only at runtime is too late, and the bundle silently ends up with `undefined` values.

See [`.env.example`](.env.example) for the full list of variables.

### Kamal

- Add every runtime variable to `env.secret` in `config/deploy.yml` and give it a source in [`.kamal/secrets`](.kamal/secrets).
- Build-time variables (`VITE_APP_NAME`, `VITE_SENTRY_DSN`) additionally need an entry under `builder.secrets`, and a source in `.kamal/secrets`. A missing one does not fail the build, it just compiles an empty value.
- Set `DATABASE_URL` for your Postgres server, and turn on `config.assume_ssl` alongside `force_ssl` if you put an SSL proxy in front.

### Heroku

- Order the buildpacks `heroku/nodejs` before `heroku/ruby`, so `npm ci` runs before `assets:precompile`.
- Set the config vars **before** the first build, since `assets:precompile` runs during slug compilation.
- `heroku/heroku-postgresql` provides `DATABASE_URL`. Size `MAX_CONNECTIONS_POOL` to fit the plan's connection limit, remembering that web and worker dynos share it.
- Jobs run on the `worker` dyno. To run them inside Puma instead, scale `worker` to 0 and set `SOLID_QUEUE_IN_PUMA=true`.
