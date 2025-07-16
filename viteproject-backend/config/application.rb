require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module ViteprojectBackend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true
    # ブラウザとサーバー間でクッキーを扱うためのミドルウェア
    config.middleware.use ActionDispatch::Cookies
    # クッキーベースのセッション管理を提供するミドルウェア
    config.middleware.use ActionDispatch::Session::CookieStore, key: '_viteproject_backend_session'
  end
end
