class AddGuildInvitesToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :guild_invites, :int
    add_column :users, :guild_locked, :boolean
  end
end
