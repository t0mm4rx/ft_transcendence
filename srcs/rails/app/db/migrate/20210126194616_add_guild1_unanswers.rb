class AddGuild1Unanswers < ActiveRecord::Migration[6.1]
  def change
    add_column :wars, :guild1_unanswers, :int
    add_column :wars, :guild2_unanswers, :int
    add_column :wars, :guild_win, :int
  end
end
