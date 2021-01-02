class CreateRelations < ActiveRecord::Migration[6.0]
  def change
    create_table :relations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :other, null: false
      t.integer :status

      # add_foreign_key :relations, :users, column: :other_id, primary_key: :id

      t.timestamps
    end
  end
end
