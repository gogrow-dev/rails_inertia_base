import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // Vite only exposes VITE_-prefixed variables, so the Rails env isn't readable
  // here; MODE is "production" for the precompiled bundle and "development"
  // under bin/dev.
  environment: import.meta.env.MODE,
  initialScope: (scope) => {
    scope.setTag("service", "frontend")
    return scope
  },
})
