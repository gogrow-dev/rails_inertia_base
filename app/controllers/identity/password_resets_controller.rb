# frozen_string_literal: true

class Identity::PasswordResetsController < InertiaController
  skip_before_action :authenticate

  before_action :set_user, only: %i[edit update]

  def new
  end

  def edit
    @email = @user.email
    @sid = params[:sid]
  end

  def create
    if @user = User.find_by(email: params[:email], verified: true)
      send_password_reset_email
      redirect_to sign_in_path, notice: t("flash.password_reset_instructions")
    else
      redirect_to new_identity_password_reset_path, alert: t("flash.unverified_email")
    end
  end

  def update
    if @user.update(user_params)
      redirect_to sign_in_path, notice: t("flash.password_reset_success")
    else
      redirect_to edit_identity_password_reset_path(sid: params[:sid]), inertia: { errors: @user.errors }
    end
  end

  private

  def set_user
    @user = User.find_by_token_for!(:password_reset, params[:sid])
  rescue StandardError
    redirect_to new_identity_password_reset_path, alert: t("flash.password_reset_invalid")
  end

  def user_params
    params.permit(:password, :password_confirmation)
  end

  def send_password_reset_email
    UserMailer.with(user: @user).password_reset.deliver_later
  end
end
