class CreateFavorites < ActiveRecord::Migration[7.2]
  def change
    create_table :favorites do |t|
      t.references :user, null: false, foreign_key: true
      t.string :book_id, null: false
      t.boolean :favorite, default: false
      t.timestamps
    end
    add_index :favorites, [:user_id, :book_id], unique: true  # 重複防止
  end
end