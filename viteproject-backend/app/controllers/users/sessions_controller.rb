class Users::SessionsController < Devise::SessionsController
  include Devise::JWT::RevocationStrategies::Denylist
  skip_before_action :verify_authenticity_token, only: [:create, :destroy], raise: false
  skip_before_action :verify_signed_out_user, only: :destroy
  before_action :set_fake_session_for_devise, only: [:destroy]  # ← destroy限定でOK
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
    # tokenの存在チェック（任意だが推奨。ないとDeviseが401を返す）
    if request.headers['Authorization'].blank?
      render json: { error: 'トークンが提供されていません' }, status: :bad_request
      return
    end  
    frontend_url = ENV['FRONTEND_URL'] || 'https://book-search-app-pearl.vercel.app'

    google_logout_url = nil
    if current_user&.provider == 'google_oauth2'
      google_logout_url = "https://accounts.google.com/logout?continue=#{CGI.escape(frontend_url)}"
    end
  
    render json: {
      message: 'ログアウトしました',
      redirect_url: frontend_url,
      google_logout_url: google_logout_url
    }, status: :ok
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

  def set_fake_session_for_devise
    # APIモードでセッションが無効でもDeviseがクラッシュしないように偽装
    if request.env['rack.session'].nil?
      request.env['rack.session'] = {}
    end
    request.env['rack.session']['enabled?'] = false  # これが鍵
  end

end