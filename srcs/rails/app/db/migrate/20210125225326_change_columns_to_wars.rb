class ChangeColumnsToWars < ActiveRecord::Migration[6.1]
  def change
    rename_column :wars, :start, :start_date
    rename_column :wars, :end, :end_date
  end
end
