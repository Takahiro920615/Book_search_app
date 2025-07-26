# app/controllers/users/omniauth_callbacks_controller.rb
class Users::OmniauthCallbacksController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:google_oauth2], raise: false

  def google_oauth2
    @user = User.from_omniauth(request.env['omniauth.auth'])
  
    if @user.persisted?
      token = Warden::JWTAuth::UserEncoder.new.call(@user, :user, nil).first
      redirect_to "http://localhost:5173/users?token=#{token}"
    else
      redirect_to "http://localhost:5173/login?error=auth_failed"
    end
  end

  def failure
    error_message = request.env['omniauth.error']&.error_reason || 'Authentication failed'
    Rails.logger.error("OmniAuth failure: #{error_message}")
    render json: { error: error_message, status: 'error' }, status: :unprocessable_entity
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
      Rails.application.secrets.secret_key_base || ENV['SECRET_KEY_BASE'],
      'HS256'
    )
  end
end