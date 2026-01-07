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
      
      begin
        decoded = JWT.decode(token, ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })
        Rails.logger.info "Decoded token payload: #{decoded[0].inspect}"
      rescue => e
        Rails.logger.error "JWT decode error: #{e.message}"
      end

      cookies[:auth_token] = {
        value: token,
        httponly: false,        # フロントで読みたいならfalse（セキュリティ的にはtrueが理想だけど今はこれでOK）
        secure: Rails.env.production?,
        same_site: :lax,
        expires: 1.hour.from_now
      }
        frontend_url = ENV['FRONTEND_URL'] || 'https://your-app.vercel.app'  # デフォルトは自分のVercel URLに
        redirect_to "#{frontend_url}/users", allow_other_host: true
    else
      Rails.logger.error "User authentication failed: #{@user&.errors&.full_messages || 'No user returned'}"
      frontend_url = ENV['FRONTEND_URL'] || 'https://your-app.vercel.app'
      redirect_to "#{frontend_url}/login?error=auth_failed", allow_other_host: true
    end
  end



  def failure
    error_message = params[:error] || request.env['omniauth.error']&.message || 'Authentication failed'
    Rails.logger.error("OmniAuth failure: #{error_message}")
    frontend_url = ENV['FRONTEND_URL'] || 'https://your-app.vercel.app'
    redirect_to "#{frontend_url}/login?error=#{CGI.escape(error_message)}", allow_other_host: true
  end

  def passthru
    Rails.logger.info("Custom passthru called with provider: #{params[:provider]}")
    super # Deviseのpassthruを呼び出し
  end
end