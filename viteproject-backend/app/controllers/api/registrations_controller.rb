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
      build_resource(sign_up_params)
  
      if resource.save
        # JWTを生成する
        token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first
        render json: {
          message: 'User created successfully',
          token: token,
          user: { id: resource.id, email: resource.email }
        }, status: :created
      else
        render json: {
          message: 'User registration failed',
          errors: resource.errors.full_messages
        }, status: :unprocessable_entity
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