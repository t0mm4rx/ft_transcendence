class AddWarsInvitesToGuilds < ActiveRecord::Migration[6.1]
  def change
    add_column :guilds, :war_invites, :int
    add_column :guilds, :isinwar, :boolean
  end
end
