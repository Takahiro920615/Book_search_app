Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 本番のVercelフロントエンドのみ許可（セキュリティのため）
    origins(
      'https://book-search-app-pearl.vercel.app',                                 
      /https:\/\/book-search-[a-z0-9]+-takahiro-shimatanis-projects\.vercel\.app/  
    )

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,          # withCredentials: true をサポート
      expose: ['Authorization']   # トークンをフロントに返す場合に必要
  end
end