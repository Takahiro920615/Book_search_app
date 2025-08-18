# app/controllers/users/omniauth_callbacks_controller.rb
class Users::OmniauthCallbacksController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:google_oauth2], raise: false

  def google_oauth2
    Rails.logger.info "OAuth2 callback received: params=#{params.inspect}"
    Rails.logger.info "OmniAuth auth: #{request.env['omniauth.auth']&.info&.email || 'no user'}"
    @user = User.from_omniauth(request.env['omniauth.auth'])
    if @user.persisted?
      token = generate_jwt_token(@user)
      Rails.logger.info "Generated token: #{token}"
      redirect_to "http://localhost:5173/users?token=#{token}", allow_other_host: true
    else
      redirect_to "http://localhost:5173/login?error=auth_failed", allow_other_host: true
    end
  end



  def failure
    error = request.env['omniauth.error']
    error_message = error&.response&.parsed&.[]('error_description') || error&.response&.parsed&.[]('error') || error&.message || 'Authentication failed'
    Rails.logger.error("OmniAuth failure: #{error_message}")
    redirect_to "http://localhost:5173/login?error=#{CGI.escape(error_message)}", allow_other_host: true
  end

  def passthru
    Rails.logger.info("Custom passthru called with provider: #{params[:provider]}")
    Rails.logger.info("OmniAuth strategy: #{request.env['omniauth.strategy']&.inspect}")
    super # Deviseのpassthruを呼び出し
  end

  private

  def generate_jwt_token(user)
    JWT.encode(
      { sub: user.id, scp: 'user', iat: Time.now.to_i, exp: Time.now.to_i + 3600 },
      ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base,
      'HS256'
    )
  end
end