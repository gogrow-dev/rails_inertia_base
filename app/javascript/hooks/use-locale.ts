import { usePage } from "@inertiajs/react"
import i18next from "i18next"
import { useEffect } from "react"

export const useLocale = () => {
  const { locale } = usePage().props

  useEffect(() => {
    if (locale) {
      void i18next.changeLanguage(locale)
    }
  }, [locale])
}
