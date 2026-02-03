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
  end
end