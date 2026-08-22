import { Form, Head } from "@inertiajs/react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import AuthLayout from "@/layouts/auth-layout"
import { identityPasswordResets } from "@/routes"

interface ResetPasswordProps {
  sid: string
  email: string
}

export default function ResetPassword({ sid, email }: ResetPasswordProps) {
  const { t } = useTranslation()

  return (
    <AuthLayout
      title={t("pages.password_resets.edit.title")}
      description={t("pages.password_resets.edit.description")}
    >
      <Head title={t("pages.password_resets.edit.title")} />
      <Form
        action={identityPasswordResets.update()}
        transform={(data) => ({ ...data, sid, email })}
        resetOnSuccess={["password", "password_confirmation"]}
      >
        {({ processing, errors }) => (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">
                {t("pages.password_resets.edit.email")}
              </FieldLabel>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                readOnly
              />
              <FieldError
                errors={errors.email?.map((message) => ({ message }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">{t("common.password")}</FieldLabel>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                autoFocus
                placeholder={t("common.password")}
              />
              <FieldError
                errors={errors.password?.map((message) => ({ message }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password_confirmation">
                {t("common.confirm_password")}
              </FieldLabel>
              <Input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                autoComplete="new-password"
                placeholder={t("common.confirm_password")}
              />
              <FieldError
                errors={errors.password_confirmation?.map((message) => ({
                  message,
                }))}
              />
            </Field>

            <Button type="submit" className="mt-4 w-full" disabled={processing}>
              {processing && <Spinner />}
              {t("pages.password_resets.edit.submit")}
            </Button>
          </FieldGroup>
        )}
      </Form>
    </AuthLayout>
  )
}
