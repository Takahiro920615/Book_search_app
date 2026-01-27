# app/controllers/api/registrations_controller.rb
module Api
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    rescue_from StandardError do |e|
      Rails.logger.error "RegistrationsController ERROR: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: e.message, type: e.class.name }, status: :internal_server_error
    end

    def create
      Rails.logger.info "===== SIGN_UP START ====="
      Rails.logger.info "Params: #{params.inspect}"
      Rails.logger.info "User params: #{params[:user].inspect}"
    
      begin
        user_params = params.require(:user).permit(:email, :password, :password_confirmation)
        Rails.logger.info "Permitted params: #{user_params.inspect}"
    
        user = User.new(user_params)
        Rails.logger.info "User object before save: #{user.inspect}"
    
        if user.save
          Rails.logger.info "Save SUCCESS: #{user.id} - #{user.email}"
          render json: { message: 'Success', user: { id: user.id, email: user.email } }, status: :created
        else
          Rails.logger.error "Save FAILED: #{user.errors.full_messages.join(', ')}"
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      rescue => e
        Rails.logger.error "EXCEPTION in create: #{e.class} - #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: { error: e.message, type: e.class.name }, status: :internal_server_error
      end
    end

    private

    def sign_up_params
      # registration ネストを許容
      user_params = params[:user] || params[:registration]&.[](:user) || {}
      user_params.permit(:email, :password, :password_confirmation)
    end
  end
end