class AddColumnIdToGameRequests < ActiveRecord::Migration[6.1]
  def change
    add_column :game_requests, :id, :primary_key
  end
end
