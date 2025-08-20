class Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, only: [:create, :destroy], raise: false
  # Devise のログアウトフィルターをスキップして jti エラーを回避
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
    # Authorization ヘッダーからトークンを取得
    token = request.headers['Authorization']&.sub(/^Bearer /, '') || ''
    if token.blank?
      return render json: { error: 'トークンが提供されていません' }, status: :unprocessable_entity
    end

    begin
      # トークンをデコード
      payload = JWT.decode(token, ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base, true, algorithm: 'HS256').first
      user = User.find_by(id: payload['sub'])

      if user
        # Devise の sign_out メソッドを呼び出してセッションを終了
        sign_out(user)
        # 必要に応じてトークンをブラックリストに追加（devise-jwt を使用している場合）
        # JWTBlacklist.create(jti: payload['jti'], exp: Time.at(payload['exp'])) if payload['jti']
        render json: { message: 'ログアウトしました' }, status: :ok
      else
        render json: { error: 'ユーザーが見つかりません' }, status: :unprocessable_entity
      end
    rescue JWT::DecodeError => e
      render json: { error: "無効なトークン: #{e.message}" }, status: :unprocessable_entity
    rescue StandardError => e
      # その他の予期しないエラーをキャッチ
      Rails.logger.error("ログアウトエラー: #{e.message}")
      render json: { error: 'サーバーエラーが発生しました' }, status: :internal_server_error
    end
  end

  private

  def generate_jwt_token(user)
    # jti を生成（一意なトークン識別子）
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