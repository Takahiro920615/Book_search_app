class DropJwtDenylistsTable < ActiveRecord::Migration[7.2]
  def change
    drop_table :jwt_denylists if table_exists?(:jwt_denylists)
  end
end
