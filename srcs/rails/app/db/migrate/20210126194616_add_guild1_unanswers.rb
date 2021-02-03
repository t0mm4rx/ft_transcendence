class AddGuild1Unanswers < ActiveRecord::Migration[6.1]
  def change
    add_column :wars, :guild1_unanswers, :int
    add_column :wars, :guild2_unanswers, :int
    add_column :wars, :guild_win, :int
    add_column :wars, :war_closed, :boolean
    add_column :wars, :wt_time_to_answer, :int
  end
end
