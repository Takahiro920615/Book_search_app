<<<<<<< HEAD
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {
    scope: 'email,profile',
    redirect_uri: 'http://localhost:3000/auth/google_oauth2/callback'
  }
end
=======
# Rails.application.config.middleware.use OmniAuth::Builder do
#   provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {
#     scope: 'email,profile',
#     redirect_uri: 'http://localhost:3000/auth/google_oauth2/callback'
#   }
# end
>>>>>>> 5c96798d613c9e5990b20671c099f1b118a8d046
