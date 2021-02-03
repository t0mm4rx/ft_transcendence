class ChangeColumnNameGameRequest < ActiveRecord::Migration[6.1]
  def change
    rename_column :game_requests, :opponent, :opponent_id
  end
end
