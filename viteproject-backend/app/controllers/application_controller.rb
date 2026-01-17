class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Devise::Controllers::Helpers
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :null_session # CSRFトークンがなくても破棄しない
  
  rescue_from StandardError do |e|
    Rails.logger.error "500 ERROR: #{e.class} - #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
  
    render json: {
      error: e.message,
      type: e.class.name,
      backtrace: e.backtrace&.first(5)
    }, status: :internal_server_error
  end

end
