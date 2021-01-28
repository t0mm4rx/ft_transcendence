class AddBanOnUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :banned_until, :datetime
  end
end
