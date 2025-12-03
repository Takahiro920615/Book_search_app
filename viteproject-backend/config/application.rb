require 'dotenv/load'
require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module ViteprojectBackend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true

    # フロントのVercelからのリクエストを許可する
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins 'https://book-search-nkwijwnqc-takahiro-shimatanis-projects.vercel.app',
                'localhost:3000',
                '127.0.0.1:3000'

        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          expose: ['Authorization'],
          credentials: true  # クッキー送信に絶対必要！
      end
    end

    # ブラウザとサーバー間でクッキーを扱うためのミドルウェア
    config.middleware.use ActionDispatch::Cookies
    # クッキーベースのセッション管理を提供するミドルウェア
    config.middleware.use ActionDispatch::Session::CookieStore, key: '_viteproject_backend_session'
    
  end
end
