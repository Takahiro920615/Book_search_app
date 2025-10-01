class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Devise::Controllers::Helpers
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :null_session # CSRFトークンがなくても破棄しない
end
