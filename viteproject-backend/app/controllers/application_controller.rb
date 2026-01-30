class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Devise::Controllers::Helpers
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :null_session # CSRFトークンがなくても破棄しない
  
  rescue_from Exception do |exception|
    Rails.logger.fatal "GLOBAL FATAL ERROR: #{exception.class} - #{exception.message}"
    Rails.logger.fatal exception.backtrace.join("\n") if exception.backtrace
  
    render json: {
      error: "Internal Server Error",
      message: exception.message,
      type: exception.class.name,
      backtrace: exception.backtrace&.first(10)  # デバッグ用（本番では削除可）
    }, status: :internal_server_error
  end

  rescue_from ActionController::ParameterMissing do |e|
    Rails.logger.error "ParameterMissing: #{e.message}"
    render json: { error: "Missing parameter: #{e.param}" }, status: :bad_request
  end

end
