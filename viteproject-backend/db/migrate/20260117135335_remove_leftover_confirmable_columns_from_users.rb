class RemoveLeftoverConfirmableColumnsFromUsers < ActiveRecord::Migration[7.2]
  def change
    safety_assured do  # データ損失を許可（本番で既存データが少ない場合）
      remove_column :users, :confirmation_token, :string if column_exists?(:users, :confirmation_token)
      remove_column :users, :confirmed_at, :datetime if column_exists?(:users, :confirmed_at)
      remove_column :users, :confirmation_sent_at, :datetime if column_exists?(:users, :confirmation_sent_at)
      remove_column :users, :unconfirmed_email, :string if column_exists?(:users, :unconfirmed_email)
    end

    # インデックスも削除
    remove_index :users, name: "index_users_on_confirmation_token" if index_exists?(:users, name: "index_users_on_confirmation_token")
  end
  end
end
