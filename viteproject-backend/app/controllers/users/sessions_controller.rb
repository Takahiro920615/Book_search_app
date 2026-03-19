class Users::SessionsController < Devise::SessionsController
  include Devise::JWT::RevocationStrategies::Denylist
  skip_before_action :verify_authenticity_token, only: [:create, :destroy], raise: false
  skip_before_action :verify_signed_out_user, only: :destroy
  before_action :set_fake_session_for_devise, only: [:destroy]  # ← destroy限定でOK
  respond_to :json

  def create
    user = User.find_by(email: params[:user][:email])
    if user&.valid_password?(params[:user][:password])
      token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
  
      render json: { token: token }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def destroy
    auth_header = request.headers['Authorization']
    token = auth_header&.sub(/^Bearer\s+/, '')
  
    if token.blank?
      return render json: { error: 'トークンがありません' }, status: :bad_request
    end

    Rails.logger.info "Logout attempt - Token present: #{token.present?}, length: #{token.length}"
  
    begin
      # devise-jwt の自動revocation（ここでエラーが出る可能性）
      # 手動で検証する必要はないので最小限に留める
  
      frontend_url = ENV['FRONTEND_URL'] || 'https://book-search-app-pearl.vercel.app'
  
      render json: {
        message: 'ログアウトしました',
        redirect_url: "#{frontend_url}/?message=success:ログアウトしました"
      }, status: :ok
  
    rescue JWT::VerificationError, JWT::DecodeError, JWT::InvalidJtiError => e
      Rails.logger.error "Logout JWT error (ignored for response): #{e.class} - #{e.message}"
      # エラーでもフロント側でトークンをクリアしてもらうので成功扱い
      render json: {
        message: 'ログアウトしました（一部処理に失敗しましたが、トークンをクリアしました）',
        redirect_url: "#{frontend_url}/?message=success:ログアウトしました"
      }, status: :ok
  
    rescue StandardError => e
      Rails.logger.error "Unexpected logout error: #{e.message}\n#{e.backtrace.join("\n")}"
      render json: { error: 'サーバーエラーが発生しました' }, status: :internal_server_error
    end
  end

  private

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
