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

  
  include Warden::JWTAuth::User  

  def self.from_omniauth(auth)
    Rails.logger.info "User.from_omniauth auth: #{auth.inspect}"
    return nil unless auth&.info

    user = where(provider: auth.provider, uid: auth.uid).first_or_create do |u|
      u.email = auth.info.email
      u.password = Devise.friendly_token[0, 20]
      u.name = auth.info.name if auth.info.name
    end

    if user.persisted?
      user
    else
      Rails.logger.error "Failed to create or find user: #{user.errors.full_messages}"
      nil
    end
  end
end