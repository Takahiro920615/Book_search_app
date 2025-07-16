class User < ApplicationRecord
  devise :database_authenticatable, 
        # メール・パスワードでログイン認証
         :registerable,
        #  サインアップ機能
         :recoverable, 
        #  パスワードリセット機能
         :rememberable, 
        #  ログイン状態を保持する機能（クッキー）
         :validatable,
        #  メールやパスワードのバリデーション
         :jwt_authenticatable, 
      #  DeviseとOmniAuthを統合してGoogleログインで取得したユーザー情報を処理する
         :omniauthable,
         # Google認証を処理するように指示する
         omniauth_providers: [:google_oauth2],
        #  JWTベースの認証を有効化
         jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null
  
         def self.from_omniauth(auth)
          Rails.logger.info("User.from_omniauth auth: #{auth.inspect}") # デバッグ用
          where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
            user.email = auth.info.email
            user.password = Devise.friendly_token[0, 20]
            # 必要に応じて他の属性を設定（例：user.name = auth.info.name）
          end
  end
end
