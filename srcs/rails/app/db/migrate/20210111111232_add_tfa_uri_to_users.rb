class AddTfaUriToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :tfa, :boolean
  end
end
