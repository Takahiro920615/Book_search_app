class Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, only: [:create], raise: false
  respond_to :json

  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    token = generate_jwt_token(resource)
    render json: {
      status: 'success',
      token: token,
      user: { id: resource.id, email: resource.email }
    }, status: :ok
  end

  def destroy
    signed_out = sign_out(resource_name)
    render json: { status: signed_out ? 'success' : 'error' }, status: :ok
  end

  private

  def generate_jwt_token(user)
    JWT.encode(
      { sub: user.id, scp: 'user', iat: Time.now.to_i, exp: Time.now.to_i + 3600 },
      Rails.application.secrets.secret_key_base || ENV['SECRET_KEY_BASE'],
      'HS256'
    )
  end

  def auth_options
    { scope: resource_name, recall: "#{controller_path}#new" }
  end
end