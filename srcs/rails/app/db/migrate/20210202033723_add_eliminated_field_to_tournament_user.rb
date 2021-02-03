class AddEliminatedFieldToTournamentUser < ActiveRecord::Migration[6.1]
  def change
    add_column :tournament_users, :eliminated, :boolean, default: false
    remove_column :tournament_users, :level
  end
end
