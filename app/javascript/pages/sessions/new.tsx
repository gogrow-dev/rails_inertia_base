import { Form, Head } from "@inertiajs/react"
import { useTranslation } from "react-i18next"

import TextLink from "@/components/text-link"
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
import { identityPasswordResets, sessions, users } from "@/routes"

export default function Login() {
  const { t } = useTranslation()

  return (
    <AuthLayout
      title={t("pages.sessions.new.heading")}
      description={t("pages.sessions.new.description")}
    >
      <Head title={t("pages.sessions.new.title")} />
      <Form
        action={sessions.create()}
        resetOnSuccess={["password"]}
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  {t("common.email_address")}
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  tabIndex={1}
                  autoComplete="email"
                  placeholder={t("common.email_placeholder")}
                />
                <FieldError
                  errors={errors.email?.map((message) => ({ message }))}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">
                    {t("common.password")}
                  </FieldLabel>
                  <TextLink
                    href={identityPasswordResets.new()}
                    className="ml-auto text-sm"
                    tabIndex={5}
                  >
                    {t("pages.sessions.new.forgot_password")}
                  </TextLink>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  tabIndex={2}
                  autoComplete="current-password"
                  placeholder={t("common.password")}
                />
                <FieldError
                  errors={errors.password?.map((message) => ({ message }))}
                />
              </Field>

              <Button
                type="submit"
                className="mt-4 w-full"
                tabIndex={4}
                disabled={processing}
              >
                {processing && <Spinner />}
                {t("common.log_in")}
              </Button>
            </FieldGroup>

            <div className="text-muted-foreground text-center text-sm">
              {t("pages.sessions.new.no_account")}{" "}
              <TextLink href={users.new()} tabIndex={5}>
                {t("common.sign_up")}
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
