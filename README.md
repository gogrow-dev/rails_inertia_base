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
