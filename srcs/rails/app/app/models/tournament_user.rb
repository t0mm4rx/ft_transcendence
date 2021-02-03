class TournamentUser < ApplicationRecord
  belongs_to :user
  belongs_to :tournament

  validate :unique_combination, on: :create

  private
  def unique_combination
    if TournamentUser.find_by(tournament: tournament, user: user)
      errors.add(:user_id, "User is already registered")
    end
  end
end
