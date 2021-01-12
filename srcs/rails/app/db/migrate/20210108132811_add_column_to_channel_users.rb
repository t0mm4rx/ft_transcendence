class AddColumnToChannelUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :channel_users, :mute_date, :datetime
  end
end
