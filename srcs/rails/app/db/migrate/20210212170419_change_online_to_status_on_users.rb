class ChangeOnlineToStatusOnUsers < ActiveRecord::Migration[6.1]
  def change
    remove_column :users, :online
    add_column :users, :status, :string
  end
end
