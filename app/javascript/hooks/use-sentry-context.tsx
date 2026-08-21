import { usePage } from "@inertiajs/react"
import * as Sentry from "@sentry/react"
import { useEffect } from "react"

export const useSentryContext = () => {
  // url and component come off the page, not its props, so the effect re-runs
  // on every Inertia navigation and not only when the user changes.
  const { props, url, component } = usePage()
  const user = props.auth?.user

  useEffect(() => {
    Sentry.setUser(null)

    if (user) {
      Sentry.setUser({
        id: user.id,
        username: `User-${user.id}`,
      })
    }
  }, [user, url, component])
}
