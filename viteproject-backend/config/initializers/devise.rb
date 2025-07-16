
require 'omniauth-google-oauth2'
Devise.setup do |config|
  config.mailer_sender ='please-change-me-at-config-initializers-devise@example.com'
  require 'devise/orm/active_record'
  Rails.logger.info("Google OAuth config: client_id=#{ENV['GOOGLE_CLIENT_ID']}, client_secret=#{ENV['GOOGLE_CLIENT_SECRET']}")
  config.omniauth :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {
    scope: 'email,profile',
    redirect_uri: 'http://localhost:3000/auth/google_oauth2/callback',
    client_options: {
      ssl: { verify: false }
    }
  }
 
  config.jwt do |jwt|
     jwt.secret = ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base
    # ログイン時にトークンを発行するエンドポイント
    jwt.dispatch_requests = [
      ['POST', %r{^/api/sign_in$}],
      ['POST', %r{^/api/sign_up$}]
    ]
    # ログアウト時にトークンを無効化するエンドポイント
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/sign_out$}]
    ]
    # JSON　apiをサポート
    jwt.request_formats = { 
      json: :json ,
      user: [:json]
    }
  end
    
  config.omniauth :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {
    scope: 'email,profile',
    redirect_uri: 'http://localhost:3000/auth/google_oauth2/callback' # バックエンドのポート
  }
  
  config.mailer_sender = 'please-change-me-at-config-initializers-devise@example.com'

  require 'devise/orm/active_record'

  config.case_insensitive_keys = [:email]

  config.strip_whitespace_keys = [:email]

  config.skip_session_storage = [:http_auth, :params_auth]
  config.navigational_formats = [:json]

  config.stretches = Rails.env.test? ? 1 : 12

  config.reconfirmable = true

  config.expire_all_remember_me_on_sign_out = true

  config.password_length = 6..128

  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/

  config.reset_password_within = 6.hours

  config.sign_out_via = :delete

  config.responder.error_status = :unprocessable_entity
  config.responder.redirect_status = :see_other

end
