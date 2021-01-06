class CreateFriendships < ActiveRecord::Migration[6.1]
  def change
    create_table :friendships, id: false do |t|
      t.references :user, null: false, foreign_key: true
      t.references :friend, null: false
      t.boolean :accepted, default: :false 

      t.timestamps
    end
    add_foreign_key :friendships, :users, column: :friend_id, primary_key: :id
    add_index :friendships, [:user_id, :friend_id], unique: true
    drop_table :relations
  end
end
