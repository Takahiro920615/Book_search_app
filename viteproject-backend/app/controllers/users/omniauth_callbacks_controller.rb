# app/controllers/users/omniauth_callbacks_controller.rb
class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token, only: [:google_oauth2], raise: false

  def google_oauth2
    Rails.logger.info "OAuth2 callback received: params=#{params.inspect}"
    Rails.logger.info "OmniAuth auth: #{request.env['omniauth.auth']&.info&.email || 'no user'}"
    @user = User.from_omniauth(request.env['omniauth.auth'])
    if @user&.persisted?	
      token = Users::SessionsController.new.send(:generate_jwt_token, @user)	
      Rails.logger.info "Generated token: #{token}"	
      # トークンをデコードして jti が含まれているか確認（デバッグ用）	# HTTP-onlyクッキーにトークンをセット
      decoded = JWT.decode(token, ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })	
      Rails.logger.info "Decoded token payload: #{decoded[0].inspect}"
        cookies[:auth_token] = {	
          value: token,	
          httponly: false, # JavaScriptからアクセス可	
          secure: Rails.env.production?, # 本番ではHTTPS必須	
          same_site: :lax, # CSRF対策	
          expires: 1.hour.from_now	
          }
          redirect_to "http://localhost:5173/users", allow_other_host: true
    else
      Rails.logger.error "User authentication failed: #{@user&.errors&.full_messages || 'No user returned'}"
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
end