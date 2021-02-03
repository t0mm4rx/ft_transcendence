class RemoveIdColumnGameRequest < ActiveRecord::Migration[6.1]
  def change
    remove_column :game_requests, :id
  end
end
