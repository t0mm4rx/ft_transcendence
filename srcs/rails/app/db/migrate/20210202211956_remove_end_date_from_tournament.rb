class RemoveEndDateFromTournament < ActiveRecord::Migration[6.1]
  def change
    remove_column :tournaments, :end_date
    add_column :tournaments, :finished, :boolean
    add_column :tournaments, :title, :string
  end
end
