Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 本番のVercelフロントエンドのみ許可（セキュリティのため）
    origins 'https://book-search-l822mpvto-takahiro-shimatanis-projects.vercel.app'

    # ローカル開発用も許可（テストしやすい）
    # origins 'https://book-search-l822mpvto-takahiro-shimatanis-projects.vercel.app', 'http://localhost:5173', 'https://localhost:5173'

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,          # withCredentials: true をサポート
      expose: ['Authorization']   # トークンをフロントに返す場合に必要
  end
end