class User < ApplicationRecord
  has_many :favorites, dependent: :destroy


  devise :database_authenticatable, 
         :registerable,
         :recoverable, 
         :rememberable, 
         :validatable,
         :jwt_authenticatable, 
         :omniauthable,
         omniauth_providers: [:google_oauth2],
         jwt_revocation_strategy: JwtDenylist

         def self.from_omniauth(auth)
          Rails.logger.info "User.from_omniauth called with auth: #{auth.inspect}"
        
          # auth や email が nil の場合は nil を返す
          return nil unless auth.present? && auth.info.present? && auth.info.email.present?
        
          user = where(provider: auth.provider, uid: auth.uid).first_or_create do |u|
            u.email = auth.info.email
            u.password = Devise.friendly_token[0, 20]
            u.provider = auth.provider # 明示的に設定（安全のため）
            u.uid = auth.uid
          end
        
          if user.persisted?
            Rails.logger.info "User successfully processed: ID=#{user.id}, email=#{user.email}"
            user
          else
            # ここが重要！ full_messages の結果（配列）を文字列に変換してからログ出力
            error_messages = user.errors.full_messages.join(', ')
            Rails.logger.error "User creation failed: #{error_messages}"
            nil
          end
        end
  
end