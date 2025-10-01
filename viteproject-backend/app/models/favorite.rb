class Favorite < ApplicationRecord
  belongs_to :user
  validates :book_id, presence: true, uniqueness: { scope: :user_id }
end