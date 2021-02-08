class AddAcceptedColumneToWar < ActiveRecord::Migration[6.1]
  def change
    add_column :wars, :accepted, :boolean
  end
end
