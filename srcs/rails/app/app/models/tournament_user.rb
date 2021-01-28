class TournamentUser < ApplicationRecord
  belongs_to :user
  belongs_to :tournament
end
