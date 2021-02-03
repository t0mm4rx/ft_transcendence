class CreateGameRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :game_requests do |t|
      t.integer :user_id
      t.integer :opponent

      t.timestamps
    end
  end
end
