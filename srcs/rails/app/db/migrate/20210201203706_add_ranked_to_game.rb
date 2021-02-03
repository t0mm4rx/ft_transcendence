class AddRankedToGame < ActiveRecord::Migration[6.1]
  def change
    add_column :game_rooms, :ladder, :boolean, default: false
    add_reference :game_rooms, :tournament, foreign_key: true
  end
end
