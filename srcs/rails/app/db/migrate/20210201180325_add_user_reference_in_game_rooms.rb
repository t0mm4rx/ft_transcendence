class AddUserReferenceInGameRooms < ActiveRecord::Migration[6.1]
  def change
    remove_column :game_rooms, :player, :string
    remove_column :game_rooms, :opponent, :string

    add_reference :game_rooms, :player, references: :users, index: true
    add_reference :game_rooms, :opponent, references: :users, index: true

    add_foreign_key :game_rooms, :users, column: :player_id
    add_foreign_key :game_rooms, :users, column: :opponent_id
  end
end
