class AddGameTypeToGameRooms < ActiveRecord::Migration[6.1]
  def change
    add_column :game_rooms, :game_type, :string
  end
end
