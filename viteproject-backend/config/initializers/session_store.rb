Rails.application.config.session_store :cookie_store,
  key: '_viteproject_backend_session',
  same_site: :none,        # または :none にするなら secure: true も必要
  secure: false,          # 本番では true に（HTTPS 前提）
  domain: nil             # サブドメイン共有などしない限り nil でOK