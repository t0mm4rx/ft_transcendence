class AddAcceptedToGameRequests < ActiveRecord::Migration[6.1]
  def change
    add_column :game_requests, :accepted, :boolean
  end
end
