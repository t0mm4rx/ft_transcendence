class SetBelongToGameRequest < ActiveRecord::Migration[6.1]
  def change
    remove_column :game_requests, :user_id

    change_table :game_requests do |t|
      t.belongs_to :user
    end
  end
end
