require 'dotenv/load'
require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module ViteprojectBackend
  class Application < Rails::Application
    config.load_defaults 7.2
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true

    # ここからCORS設定（これで永遠に死なない）
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins 'https://book-search-app-pearl.vercel.app',  # ← 本番URL
                'http://localhost:3000',
                'http://127.0.0.1:3000'

        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          credentials: true,
          expose: ['Authorization']
      end
    end
    # ここまで

    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore, key: '_viteproject_backend_session'
  end
end