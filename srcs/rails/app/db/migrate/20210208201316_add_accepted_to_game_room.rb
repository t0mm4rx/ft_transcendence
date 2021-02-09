class AddAcceptedToGameRoom < ActiveRecord::Migration[6.1]
  def change
    add_column :game_rooms, :accepted, :boolean, :default => false
  end
end
