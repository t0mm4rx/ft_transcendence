class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|
      t.string :username
      t.string :login
      t.string :avatar
      t.integer :guild_id
      t.integer :wins
      t.integer :losses
      t.boolean :online
      t.boolean :admin

      t.timestamps
    end
  end
end
