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
         jwt_revocation_strategy: JwtDenylist
  
         def self.from_omniauth(auth)
          Rails.logger.info "User.from_omniauth auth: #{auth.inspect}"
          return nil unless auth&.info # authがnilまたはinfoがない場合はnilを返す
      
          user = where(provider: auth.provider, uid: auth.uid).first_or_create do |u|
            u.email = auth.info.email
            u.password = Devise.friendly_token[0, 20]
            u.name = auth.info.name if auth.info.name # 名前をオプションで設定
          end
      
          if user.persisted?
            user
          else
            Rails.logger.error "Failed to create or find user: #{user.errors.full_messages}"
            nil
          end
        end
      end
