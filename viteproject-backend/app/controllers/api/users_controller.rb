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
      token = request.headers['Authorization'].to_s.sub('Bearer ', '')
      begin
        Warden::JWTAuth::UserDecoder.new.call(token, :user, nil)
        super
      rescue Warden::JWTAuth::InvalidToken, Warden::JWTAuth::NilUser
        render json: { error: 'Unauthorized' }, status: :unauthorized
      end
    end
  end
end