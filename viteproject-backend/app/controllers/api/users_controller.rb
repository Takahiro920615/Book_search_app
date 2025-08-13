# app/controllers/api/users_controller.rb
# app/controllers/api/users_controller.rb
module Api
  class UsersController < ApplicationController
    before_action :authenticate_user!
    respond_to :json

    def show
      render json: {
        id: current_user.id,
        email: current_user.email,
        last_login: current_user.last_sign_in_at
      }, status: :ok
    end

    def protected
      render json: { message: "You are authenticated!", user: current_user.email }, status: :ok
    end

    private

    # 認証失敗時のカスタムレスポンス
    def authenticate_user!
      header = request.headers['Authorization']
      token = header&.split(' ')&.last
      return render json: { error: 'Token missing' }, status: :unauthorized unless token
    
      begin
        decoded_token = JWT.decode(token, Rails.application.credentials.secret_key_base || ENV['SECRET_KEY_BASE'])
        @current_user = User.find(decoded_token[0]['user_id'])
      rescue JWT::DecodeError
        render json: { error: 'Invalid token' }, status: :unauthorized
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :unauthorized
      end
    end
  end
end