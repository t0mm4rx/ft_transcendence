class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.string :username
      t.string :login
      t.string :avatar_url
      t.string :guild
      t.integer :wins
      t.integer :losses
      t.boolean :admin
      t.boolean :online

      t.timestamps
    end
  end
end
