class CreateTournaments < ActiveRecord::Migration[6.1]
  def change
    create_table :tournaments do |t|
      t.string :name
      t.datetime :start_date
      t.datetime :end_date
      t.datetime :registration_start

      t.timestamps
    end
  end
end
