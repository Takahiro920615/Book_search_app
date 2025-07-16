# app/controllers/users/omniauth_callbacks_controller.rb
class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token, only: [:google_oauth2], raise: false

  def google_oauth2
    auth = request.env['omniauth.auth']
    Rails.logger.info("OmniAuth auth: #{auth.inspect}") # デバッグ用
    unless auth
      Rails.logger.error("OmniAuth auth data is nil: #{request.env['omniauth.error']&.inspect}")
      return render json: { error: 'Authentication data not found', status: 'error' }, status: :unprocessable_entity
    end

    user = User.from_omniauth(auth)
    if user.persisted?
      sign_in(user)
      token = generate_jwt_token(user)
      render json: { token: token, status: 'success', user: { id: user.id, email: user.email } }, status: :ok
    else
      render json: { error: 'Googleログインに失敗しました。', status: 'error' }, status: :unprocessable_entity
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