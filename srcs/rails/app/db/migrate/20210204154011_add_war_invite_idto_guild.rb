class AddWarInviteIdtoGuild < ActiveRecord::Migration[6.1]
  def change
    add_column :guilds, :war_invite_id, :int
  end
end
