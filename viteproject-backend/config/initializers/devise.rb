require 'omniauth-google-oauth2'

Devise.setup do |config|
  config.mailer_sender = 'please-change-me@example.com'
  require 'devise/orm/active_record'

  Rails.logger.info("Starting Devise initializer...")
  Rails.logger.info("Google OAuth config: client_id=#{ENV['GOOGLE_CLIENT_ID']}")

  # OmniAuthストラテジーの設定
  config.omniauth :google_oauth2,
    ENV['GOOGLE_CLIENT_ID'],
    ENV['GOOGLE_CLIENT_SECRET'],
    {
      scope: 'email,profile,openid',
      prompt: 'select_account',
      image_aspect_ratio: 'square',
      image_size: 50,
      provider_ignores_state: 'false',
      access_type: 'offline',
    }
  # OmniAuthのグローバル設定
  OmniAuth.config.allowed_request_methods = %i[get]
  OmniAuth.config.silence_get_warning = true

  config.jwt do |jwt|
    secret = Rails.application.secret_key_base
  
    if secret.blank?
      raise "SECRET_KEY_BASE missing!"
    end
  
    jwt.secret = secret
  
    Rails.logger.info "JWT secret loaded"
    Rails.logger.info "Length: #{secret.length}"
  
    jwt.dispatch_requests = [
      ['POST', %r{^/api/sign_in$}],
      ['POST', %r{^/api/sign_up$}]
    ]
  
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/sign_out$}]
    ]
  
    jwt.request_formats = {
      json: :json,
      user: [:json]
    }
  
    jwt.expiration_time = 24.hours.to_i
  end

  config.navigational_formats = [:json]
  config.sign_out_via = :delete
end