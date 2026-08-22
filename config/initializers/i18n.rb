# frozen_string_literal: true

if Rails.env.development? && !ENV["CI"]
  Rails.application.config.after_initialize do
    require "i18n-js/listen"
    I18nJS.listen
  end
end
