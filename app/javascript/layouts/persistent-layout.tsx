import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { useFlash } from "@/hooks/use-flash"
import { useSentryContext } from "@/hooks/use-sentry-context"

interface PersistentLayoutProps {
  children: ReactNode
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  useFlash()
  useSentryContext()
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  )
}
