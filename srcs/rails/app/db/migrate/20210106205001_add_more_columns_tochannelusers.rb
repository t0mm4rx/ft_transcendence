class AddMoreColumnsTochannelusers < ActiveRecord::Migration[6.1]
  def change
    add_column :channel_users, :owner, :boolean
    add_column :channel_users, :admin, :boolean
    add_column :channel_users, :ban_date, :datetime
  end
end
