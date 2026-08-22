import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { useFlash } from "@/hooks/use-flash"
import { useLocale } from "@/hooks/use-locale"
import { useSentryContext } from "@/hooks/use-sentry-context"

interface PersistentLayoutProps {
  children: ReactNode
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  useFlash()
  useLocale()
  useSentryContext()
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  )
}
