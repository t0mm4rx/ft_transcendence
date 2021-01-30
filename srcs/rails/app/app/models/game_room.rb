class GameRoom < ApplicationRecord

	# after a ladder game is finished we need to update the users' scores
	# for more info: https://github.com/mxhold/elo_rating
	def calculate_new_user_score
		newScores = EloRating::Match.new.add_player(rating: p1.ladder_score).add_player(p2.ladder_score, winner: score2 > score1).updated_ratings # => [1988, 2012]
		p1.update_attributes(ladder_score: newScores[0])
		p2.update_attributes(ladder_score: newScores[1])
	end
end
