module Api
  class UsersController < ApplicationController
    before_action :authenticate_user!
    respond_to :json

    def show
      Rails.logger.info "=== /api/user called ==="
      Rails.logger.info "Authorization header: #{request.headers['Authorization'].inspect}"
      Rails.logger.info "Warden authenticated? #{warden.authenticated?}"
      Rails.logger.info "Current user ID: #{current_user&.id.inspect}"
      Rails.logger.info "Current user email: #{current_user&.email.inspect}"
      Rails.logger.info "JWT secret present in ENV: #{ENV['SECRET_KEY_BASE'].present?}"

      if current_user
        render json: {
          id: current_user.id,
          email: current_user.email,
          last_login: current_user.last_sign_in_at
        }, status: :ok
      else
        render json: { error: 'Unauthorized - token invalid or expired' }, status: :unauthorized
      end
    end

    def protected
      Rails.logger.info "Protected endpoint - current_user: #{current_user&.id.inspect}"
      render json: { message: "You are authenticated!", user: current_user&.email }, status: :ok
    end
  end
end