class AddPasswordDigestToChannel < ActiveRecord::Migration[6.1]
  def change
    add_column :channels, :password_digest, :string
  end
end
