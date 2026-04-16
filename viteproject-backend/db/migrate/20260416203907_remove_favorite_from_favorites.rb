class RemoveFavoriteFromFavorites < ActiveRecord::Migration[7.2]
  def change
    remove_column :favorites, :favorite, :boolean
  end
end
