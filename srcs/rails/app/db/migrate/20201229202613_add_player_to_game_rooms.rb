class AddPlayerToGameRooms < ActiveRecord::Migration[6.1]
  def change
    add_column :game_rooms, :player, :string
    add_column :game_rooms, :opponent, :string
    remove_column :game_rooms, :name
  end
end
