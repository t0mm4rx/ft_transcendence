class AddGameNumberClientToGameRooms < ActiveRecord::Migration[6.1]
  def change
    add_column :game_rooms, :number_client, :integer
  end
end
