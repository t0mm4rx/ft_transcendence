class RenameColumnGame < ActiveRecord::Migration[6.1]
  def change
    rename_column :game_rooms, :number_client, :number_player
  end
end
