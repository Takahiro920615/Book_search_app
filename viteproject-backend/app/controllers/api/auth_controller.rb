class Api::AuthController < ApplicationController
  def me
    Rails.logger.info "=== /api/auth/me called ==="
    Rails.logger.info "Cookies: #{cookies.to_h.inspect}"
    Rails.logger.info "auth_token present? #{cookies[:auth_token].present?}"
    token = cookies[:auth_token]

    if token.present?
      begin
        secret = ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base
        decoded = JWT.decode(token, secret, true, { algorithm: 'HS256' }).first
        Rails.logger.info "JWT decoded successfully: #{decoded.inspect}"
        user = User.find_by(id: decoded['sub'])

        if user
          Rails.logger.info "User found: #{user.id} - #{user.email}"
          render json: {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@').first,
            # 必要に応じて他の情報も追加（last_loginなど）
          }, status: :ok
          return
        end
      rescue JWT::DecodeError, JWT::ExpiredSignature => e
        Rails.logger.warn "JWT decode error: #{e.message}"
      rescue => e
        Rails.logger.error "Unexpected error in /api/auth/me: #{e.message}"
      end
    end

    # トークンなし or 無効な場合
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end
end