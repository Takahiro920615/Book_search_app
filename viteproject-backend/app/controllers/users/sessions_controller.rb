class Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, only: [:create], raise: false
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
    token = request.headers['Authorization']&.sub(/^Bearer /, '') || ''
    if token.blank?
      return render json: { error: 'No token provided' }, status: :unprocessable_entity
    end

    begin
      payload = JWT.decode(token, ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base, true, algorithm: 'HS256').first
      user = User.find_by(id: payload['sub'])
      if user
        # トークンを無効化（例: ブラックリストに追加する場合はここにロジック）
        render json: { message: 'Logged out successfully' }, status: :ok
      else
        render json: { error: 'User not found' }, status: :unprocessable_entity
      end
    rescue JWT::DecodeError => e
      render json: { error: "Invalid token: #{e.message}" }, status: :unprocessable_entity
    end
  end

  private

  def generate_jwt_token(user)
    JWT.encode(
      { sub: user.id, scp: 'user', iat: Time.now.to_i, exp: Time.now.to_i + 24 * 3600 }, # ← 修正: sub を使用
      ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base,
      'HS256'
    )
  end

  def auth_options
    { scope: resource_name, recall: "#{controller_path}#new" }
  end
end