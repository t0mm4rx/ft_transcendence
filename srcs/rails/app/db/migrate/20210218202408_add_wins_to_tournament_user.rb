class AddWinsToTournamentUser < ActiveRecord::Migration[6.1]
  def change
    add_column :tournament_users, :wins, :integer, default: 0
  end
end
