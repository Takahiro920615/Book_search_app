# app/controllers/api/registrations_controller.rb
module Api
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    def create
      Rails.logger.info "Sign up params received: #{params.inspect}"

      # パラメータを手動で受け取ってログ出力
      user_params = params.require(:user).permit(:email, :password, :password_confirmation)
      Rails.logger.info "Permitted user params: #{user_params.inspect}"

      user = User.new(user_params)

      if user.save
        Rails.logger.info "User saved successfully: #{user.id} - #{user.email}"
        render json: { message: 'User created successfully', user: { id: user.id, email: user.email } }, status: :created
      else
        Rails.logger.error "User save failed: #{user.errors.full_messages.join(', ')}"
        render json: { message: 'Registration failed', errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def sign_up_params
      params.require(:user).permit(:email, :password, :password_confirmation)
    end
  end
end