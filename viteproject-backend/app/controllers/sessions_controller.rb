class SessionsController < ApplicationController
  # def callback
  #   auth = request.env['omniauth.auth']
  #   user = User.find_or_create_by(email: auth['info']['email']) do |u|
  #     u.name = auth['info']['name']
  #     u.provider = auth['provider']
  #     u.uid = auth['uid']
  #   end
  #   session[:user_id] = user.id
  #   redirect_to 'http://localhost:5173' # Viteのフロントエンドにリダイレクト
  # end
end