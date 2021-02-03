class AddGameInviteDateToGuilds < ActiveRecord::Migration[6.1]
  def change
    add_column :guilds, :wt_date_to_answer, :datetime
  end
end
