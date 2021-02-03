class SetBelongToGameRequestKey < ActiveRecord::Migration[6.1]
  def change
    remove_column :game_requests, :user_id
    remove_column :game_requests, :opponent_id

    change_table :game_requests do |t|
      t.belongs_to :user, foreing_key: true
      t.belongs_to :opponent_id, foreing_key: true
    end
  end
end
