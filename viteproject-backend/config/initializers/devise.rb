
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
    scope: 'email,profile',
    prompt: 'select_account',
    image_aspect_ratio: 'square',
    image_size: 50,
    access_type: 'offline',
    redirect_uri: 'http://localhost:3000/api/auth/google_oauth2/callback', # 本番ではENVを使用
    provider_ignores_state: false,
    client_options: {
      ssl: { verify: false } # ローカル開発用。本番では削除またはtrueに
    }

  # OmniAuthのグローバル設定
  OmniAuth.config.allowed_request_methods = %i[get]
  OmniAuth.config.silence_get_warning = true

  config.jwt do |jwt|
    jwt.secret = ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base
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
    jwt.expiration_time = 24.hours.to_i  # 有効期限（オプション）
  end

  config.navigational_formats = [:json]
  config.sign_out_via = :delete
end