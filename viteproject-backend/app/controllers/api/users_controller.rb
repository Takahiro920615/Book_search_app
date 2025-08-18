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
      token = request.headers['Authorization']&.sub(/^Bearer /, '') || ''
      if token.blank?
        return render json: { error: 'No token provided' }, status: :unauthorized
      end
  
      begin
        payload = JWT.decode(token, ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base, true, algorithm: 'HS256').first
        @current_user = User.find_by(id: payload['sub'])
        if @current_user.nil?
          render json: { error: 'User not found' }, status: :unauthorized
        end
      rescue JWT::ExpiredSignature
        render json: { error: 'Token expired' }, status: :unauthorized
      rescue JWT::DecodeError => e
        render json: { error: "Invalid token: #{e.message}" }, status: :unauthorized
      end
    end
  end
end