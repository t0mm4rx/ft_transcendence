class AddColumsToGameRooms < ActiveRecord::Migration[6.1]
  def change
    add_column :game_rooms, :player_score, :int
    add_column :game_rooms, :opponent_score, :int
    add_column :game_rooms, :winner_id, :int
    add_column :game_rooms, :winner_score, :int
  end
end
