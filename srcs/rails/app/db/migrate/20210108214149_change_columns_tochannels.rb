class ChangeColumnsTochannels < ActiveRecord::Migration[6.1]
  def change
    change_column :channels, :direct, :boolean, :default => false
    change_column :channels, :password, :string, :default => nil
  end
end
