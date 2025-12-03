Rails.application.config.middleware.insert_before 0, Rack::Cors do
  
  # Renderの自分のURLからもアクセスできるように
  allow do
    origins 'https://book-search-app-1.onrender.com'
    resource '*',
      headers: :any,
      methods: [:get, :post, :options, :head],
      credentials: true
  end
end