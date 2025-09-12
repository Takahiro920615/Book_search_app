# JWTトークンの取り消しを扱うためのテーブル
class JwtDenylist < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist
  self.table_name = 'jwt_denylist'
end

