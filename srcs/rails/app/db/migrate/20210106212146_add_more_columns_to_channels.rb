class AddMoreColumnsToChannels < ActiveRecord::Migration[6.1]
  def change
    add_column :channels, :public, :boolean
    add_column :channels, :private, :boolean
    add_column :channels, :password, :string
    add_column :channels, :direct, :boolean
  end
end
