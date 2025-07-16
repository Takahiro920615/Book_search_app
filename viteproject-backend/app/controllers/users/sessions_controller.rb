class Users::SessionsController < Devise::SessionsController
  # コントローラーがJSON形式でレスポンスを返すように設定
  respond_to :json

  private
  # ログイン成功時（post /api/sign_in）に呼び出されて、JSONレスポンスを返す
  def respond_with(resource, _opts = {})
  token = request.env['warden-jwt_auth.token']
  puts ">>> TOKEN: #{token.inspect}"
  response.set_header('Authorization', "Bearer #{token}") if token
  render json: {
    message: 'Logged in successfully.',
    token: token, # ← JSON に含めて確認
    user: resource
  }, status: :ok
end

  # ログアウト時（DELETE /api/sign_out)に呼び出され、ログアウトの成功/失敗のメッセージを返す
  def respond_to_on_destroy
    if current_user
      render json: { message: "Logged out successfully." }, status: :ok
    else
      render json: { message: "User already logged out." }, status: :unauthorized
    end
  end
end