class CreateTournamentUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :tournament_users do |t|
      t.references :user, null: false, foreign_key: true
      t.references :tournament, null: false, foreign_key: true
      t.integer :level

      t.timestamps
    end
  end
end
