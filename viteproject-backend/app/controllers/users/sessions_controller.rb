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
    # APIではサーバー側でセッションを持たないので、フロントでトークン削除すればOK
    # JWTブラックリストを使う場合はここで無効化処理
    head :no_content
  end

  private

  def generate_jwt_token(user)
    payload = {
      user_id: user.id,
      exp: (Time.now + 24.hours).to_i # 24時間後に期限切れ
    }
    secret_key = Rails.application.credentials.secret_key_base || ENV['SECRET_KEY_BASE']
    JWT.encode(payload, secret_key)
  end

  def auth_options
    { scope: resource_name, recall: "#{controller_path}#new" }
  end
end