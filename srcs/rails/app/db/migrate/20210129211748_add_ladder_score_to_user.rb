class AddLadderScoreToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :ladder_score, :integer, default: 1000
  end
end
