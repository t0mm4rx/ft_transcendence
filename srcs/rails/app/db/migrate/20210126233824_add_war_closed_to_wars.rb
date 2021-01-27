class AddWarClosedToWars < ActiveRecord::Migration[6.1]
  def change
    add_column :wars, :war_closed, :boolean
  end
end
