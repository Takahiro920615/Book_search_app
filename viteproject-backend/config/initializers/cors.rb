Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
   
    origins "https://book-search-app-pearl.vercel.app", "http://localhost:5173"

    # 必要に応じてローカル開発用も追加（テスト時用）
    # origins "https://book-search-app-pearl.vercel.app", "http://localhost:5173"

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,          # withCredentials: true を許可（クッキー/JWT用）
      expose: ['Authorization']   # Authorizationヘッダーを露出（任意だがおすすめ）
  end
end