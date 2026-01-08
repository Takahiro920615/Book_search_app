class Users::SessionsController < Devise::SessionsController
  include Devise::JWT::RevocationStrategies::Denylist
  skip_before_action :verify_authenticity_token, only: [:create, :destroy], raise: false
  skip_before_action :verify_signed_out_user, only: :destroy
  respond_to :json

  def create
    user = User.find_by(email: params[:user][:email])
    if user&.valid_password?(params[:user][:password])
      token = generate_jwt_token(user)
      render json: { token: token }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def destroy
    Rails.logger.info "Sign out called with headers: #{request.headers['Authorization']}"
    token = request.headers['Authorization']&.split('Bearer ')&.last

    unless token
      Rails.logger.error "No token provided for sign out"
      render json: { error: 'トークンが提供されていません' }, status: :bad_request
      return
    end

    begin
      decoded = JWT.decode(token, ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })
      jti = decoded[0]['jti']
      raise JWT::InvalidJtiError, 'Missing jti' unless jti

      # JWTをdenylistに追加
      JwtDenylist.create!(jti: jti, exp: Time.at(decoded[0]['exp']))

      # ユーザーをサインアウト（current_userが存在する場合）
      if current_user
        sign_out(current_user)
        Rails.logger.info "User signed out successfully: #{current_user.id}"
      end

     frontend_url = ENV['FRONTEND_URL'] || 'https://book-search-app-pearl.vercel.app'

      # Googleユーザー向けログアウトURL（OmniAuthの場合のみ）
      google_logout_url = "https://accounts.google.com/logout?continue=#{CGI.escape(frontend_url)}"
      if current_user&.provider == 'google_oauth2'
        google_logout_url = "https://accounts.google.com/logout?continue=#{frontend_url}"
      end

      render json: {
        message: 'ログアウトしました',
        redirect_url: frontend_url,
        google_logout_url: google_logout_url
      }, status: :ok

    rescue JWT::DecodeError => e
      Rails.logger.error "Invalid token for sign out: #{e.message}"
      render json: { error: "無効なトークン: #{e.message}" }, status: :unauthorized
    rescue JWT::InvalidJtiError => e
      Rails.logger.error "Database error in logout: #{e.message}"
      render json: { error: 'ログアウト処理中にデータベースエラーが発生しました' }, status: :internal_server_error
    rescue StandardError => e
      Rails.logger.error "Sign out error: #{e.message}, Backtrace: #{e.backtrace.join('\n')}"
      render json: { error: "サーバーエラー: #{e.message}" }, status: :internal_server_error
    end
  end

  private

  def generate_jwt_token(user)
    jti = SecureRandom.uuid
    JWT.encode(
      { sub: user.id, scp: 'user', iat: Time.now.to_i, exp: Time.now.to_i + 24 * 3600, jti: jti },
      ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base,
      'HS256'
    )
  end

  def respond_to_on_destroy
    render json: { message: 'ログアウトしました' }, status: :ok
  end

  def auth_options
    { scope: resource_name, recall: "#{controller_path}#new" }
  end
end