class AddGameStatusToGameRooms < ActiveRecord::Migration[6.1]
  def change
    add_column :game_rooms, :status, :string
  end
end
