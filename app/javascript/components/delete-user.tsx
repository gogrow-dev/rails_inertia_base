import { Form } from "@inertiajs/react"
import { useRef } from "react"
import { useTranslation } from "react-i18next"

import HeadingSmall from "@/components/heading-small"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { users } from "@/routes"

export default function DeleteUser() {
  const { t } = useTranslation()
  const passwordInput = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      <HeadingSmall
        title={t("components.delete_account.title")}
        description={t("components.delete_account.description")}
      />
      <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
        <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
          <p className="font-medium">
            {t("components.delete_account.warning")}
          </p>
          <p className="text-sm">{t("components.delete_account.caution")}</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">
              {t("components.delete_account.title")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              {t("components.delete_account.confirm_title")}
            </DialogTitle>
            <DialogDescription>
              {t("components.delete_account.confirm_description")}
            </DialogDescription>
            <Form
              action={users.destroy()}
              options={{
                preserveScroll: true,
              }}
              onError={() => passwordInput.current?.focus()}
              resetOnSuccess
              className="space-y-6"
            >
              {({ resetAndClearErrors, processing, errors }) => (
                <>
                  <Field>
                    <FieldLabel
                      htmlFor="password_challenge"
                      className="sr-only"
                    >
                      {t("common.password")}
                    </FieldLabel>

                    <Input
                      id="password_challenge"
                      type="password"
                      name="password_challenge"
                      ref={passwordInput}
                      placeholder={t("common.password")}
                      autoComplete="current-password"
                    />

                    <FieldError
                      errors={errors.password_challenge?.map((message) => ({
                        message,
                      }))}
                    />
                  </Field>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        onClick={() => resetAndClearErrors()}
                      >
                        {t("common.cancel")}
                      </Button>
                    </DialogClose>

                    <Button variant="destructive" disabled={processing} asChild>
                      <button type="submit">
                        {t("components.delete_account.title")}
                      </button>
                    </Button>
                  </DialogFooter>
                </>
              )}
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
