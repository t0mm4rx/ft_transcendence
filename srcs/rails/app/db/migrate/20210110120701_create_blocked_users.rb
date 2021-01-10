class CreateBlockedUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :blocked_users do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.bigint :target_id

      t.timestamps
    end
  end
end
