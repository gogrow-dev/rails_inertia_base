import { Head } from "@inertiajs/react"
import { useTranslation } from "react-i18next"

import AppearanceTabs from "@/components/appearance-tabs"
import HeadingSmall from "@/components/heading-small"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { settingsAppearance } from "@/routes"
import type { BreadcrumbItem } from "@/types"

export default function Appearance() {
  const { t } = useTranslation()

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t("pages.settings.appearance.title"),
      href: settingsAppearance().url,
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title={t("pages.settings.appearance.title")}
            description={t("pages.settings.appearance.description")}
          />
          <AppearanceTabs />
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
