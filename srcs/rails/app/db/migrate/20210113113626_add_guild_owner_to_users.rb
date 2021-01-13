class AddGuildOwnerToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :guild_owner, :boolean
    add_column :users, :guild_officer, :boolean
    add_foreign_key :users, :guilds
  end
end
