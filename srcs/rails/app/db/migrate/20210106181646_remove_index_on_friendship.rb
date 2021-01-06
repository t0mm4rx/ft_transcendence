class RemoveIndexOnFriendship < ActiveRecord::Migration[6.1]
  def change
    remove_index :friendships, name: "index_friendships_on_user_id_and_friend_id"
    add_column :friendships, :id, :primary_key
  end
end
