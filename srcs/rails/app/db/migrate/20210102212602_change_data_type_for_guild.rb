class ChangeDataTypeForGuild < ActiveRecord::Migration[6.1]
  # change_table :users do |t|
  #   t.change :guild, references: :guild
  # end
  def self.up
    change_table :users do |t|
      t.references :guild
    end
  end

  def self.down
    remove_column :users, :guild
  end
end
