Rails.application.config.middleware.insert_before 0, Rack::Cors do
  # 本番環境（Vercel）からのアクセスを許可
  allow do
    origins 'https://book-search-app-pearl.vercel.app'  

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true  # Cookieを送るために絶対必要！！
  end

  # ローカル開発用
  allow do
    origins 'http://localhost:5173', 'http://127.0.0.1:5173'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end

  # Renderの自分のURLからもアクセスできるように
  allow do
    origins 'https://book-search-app-1.onrender.com'
    resource '*',
      headers: :any,
      methods: [:get, :post, :options, :head],
      credentials: true
  end
end