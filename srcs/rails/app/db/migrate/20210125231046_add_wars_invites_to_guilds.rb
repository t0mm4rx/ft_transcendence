class AddWarsInvitesToGuilds < ActiveRecord::Migration[6.1]
  def change
    add_column :guilds, :war_invites, :int
    add_column :guilds, :isinwar, :boolean
    add_column :guilds, :present_war_id, :int
    add_column :guilds, :wt_game_invite, :int
    add_column :guilds, :isinwtgame, :boolean
  end
end
