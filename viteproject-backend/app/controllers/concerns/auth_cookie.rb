module AuthCookie
  extend ActiveSupport::Concern

  def set_auth_cookie(token)
    cookies[:auth_token] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :none,
      expires: 24.hours.from_now,
      path: '/'
    }
  end
end