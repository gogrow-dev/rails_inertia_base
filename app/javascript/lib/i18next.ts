import i18next from "i18next"
import { initReactI18next } from "react-i18next"

import en from "@/locales/en.json"

void i18next.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes by default
    // Rails writes %{name} placeholders; keep one syntax on both sides.
    prefix: "%{",
    suffix: "}",
  },
  resources: {
    en: { translation: en.en },
  },
})

export default i18next
