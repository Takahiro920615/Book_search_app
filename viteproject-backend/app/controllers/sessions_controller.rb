class SessionsController < ApplicationController
  def callback
    auth = request.env['omniauth.auth']
    user = User.find_or_create_by(email: auth['info']['email']) do |u|
      u.name = auth['info']['name']
      u.provider = auth['provider']
      u.uid = auth['uid']
      
    end
    session[:user_id] = user.id
    frontend_url = ENV['FRONTEND_URL'] || 'http://localhost:5173'
    redirect_to frontend_url # Viteのフロントエンドにリダイレクト
  end
end