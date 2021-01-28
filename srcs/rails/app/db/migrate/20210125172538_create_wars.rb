class CreateWars < ActiveRecord::Migration[6.1]
  def change
    create_table :wars do |t|
      t.integer :guild1_id, null: false
      t.integer :guild2_id, null: false
      t.datetime :start
      t.datetime :end
      t.datetime :wt_start
      t.datetime :wt_end
      t.integer :wt_max_unanswers
      t.boolean :add_count_all
      t.integer :guild1_score
      t.integer :guild2_score
      t.integer :prize

      t.timestamps
    end
    add_foreign_key :wars, :guilds, column: :guild1_id
    add_foreign_key :wars, :guilds, column: :guild2_id
  end
end
