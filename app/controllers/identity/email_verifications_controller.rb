# frozen_string_literal: true

class Identity::EmailVerificationsController < InertiaController
  skip_before_action :authenticate, only: :show

  before_action :set_user, only: :show

  def show
    @user.update! verified: true
    redirect_to root_path, notice: t("flash.email_verified")
  end

  def create
    send_email_verification
    redirect_back_or_to root_path, notice: t("flash.email_verification_sent")
  end

  private

  def set_user
    @user = User.find_by_token_for!(:email_verification, params[:sid])
  rescue StandardError
    redirect_to settings_email_path, alert: t("flash.email_verification_invalid")
  end

  def send_email_verification
    UserMailer.with(user: Current.user).email_verification.deliver_later
  end
end
