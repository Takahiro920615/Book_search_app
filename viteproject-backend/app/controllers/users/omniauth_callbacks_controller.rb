# app/controllers/users/omniauth_callbacks_controller.rb
class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token, only: [:google_oauth2], raise: false

  def google_oauth2
    Rails.logger.info "OAuth2 callback received"
    auth = request.env['omniauth.auth']
    Rails.logger.info "Auth data: #{auth.inspect}"
  
    @user = User.from_omniauth(auth)
  
    if @user&.persisted?
      # ここで直接JWTを生成（SessionsControllerと同じロジックをコピー）
      jti = SecureRandom.uuid
      payload = {
        sub: @user.id,
        scp: 'user',
        iat: Time.now.to_i,
        exp: Time.now.to_i + 24.hours.to_i,
        jti: jti
      }
      secret = ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base
      token = JWT.encode(payload, secret, 'HS256')
  
      Rails.logger.info "Generated JWT token for user #{@user.id}: #{token}"
  
      cookies[:auth_token] = {
      value:    token,
      httponly: true,
      secure:   Rails.env.production?,   # 本番は true
      same_site: :none,                  # ← ここを :none に変更（クロスサイト対応）
      expires:  24.hours.from_now,
      path:     '/'                      # ← 明示的に追加
    }
  
      frontend_url = ENV['FRONTEND_URL'] || 'https://book-search-app-pearl.vercel.app'
      # 
      redirect_to "#{frontend_url}/users", allow_other_host: true
    else
      error_messages = @user&.errors&.full_messages&.join(', ') || 'Unknown error during user creation'
      Rails.logger.error "Failed to persist user: #{error_messages}"
      frontend_url = ENV['FRONTEND_URL'] || 'https://book-search-app-pearl.vercel.app'
      redirect_to "#{frontend_url}/login?error=user_creation_failed", allow_other_host: true
    end
  end



  def failure
    error_message = params[:error] || request.env['omniauth.error']&.message || 'Authentication failed'
    Rails.logger.error("OmniAuth failure: #{error_message}")
    frontend_url = ENV['FRONTEND_URL'] || 'https://book-search-app-pearl.vercel.app'
    redirect_to "#{frontend_url}/login?error=#{CGI.escape(error_message)}", allow_other_host: true
  end

  def passthru
    Rails.logger.info("Custom passthru called with provider: #{params[:provider]}")
    super # Deviseのpassthruを呼び出し
  end
end