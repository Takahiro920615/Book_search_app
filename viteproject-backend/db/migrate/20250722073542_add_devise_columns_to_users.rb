class AddDeviseColumnsToUsers < ActiveRecord::Migration[7.2]
  def change
    change_table :users do |t|
      ## Omniauthable
      t.string :provider
      t.string :uid
    end
  end
end
