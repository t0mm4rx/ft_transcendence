class GameRoom < ApplicationRecord

	# after a ladder game is finished we need to update the users' scores
	# for more info: https://github.com/mxhold/elo_rating
	# def calculate_new_user_score
	# 	newScores = EloRating::Match.new.add_player(rating: p1.ladder_score).add_player(p2.ladder_score, winner: score2 > score1).updated_ratings # => [1988, 2012]
	# 	p1.update_attributes(ladder_score: newScores[0])
	# 	p2.update_attributes(ladder_score: newScores[1])

	# after a ladder game is finished we need to update the users' scores
	# for more info: https://github.com/mxhold/elo_rating
	def calculate_new_user_score
		p1  = Elo::Player.new(rating: p1.ladder_score)
		p2 = Elo::Player.new(rating: p2.ladder_score)
		game = p1.versus(p2, result: p1.score > p2.score)
		p1.update(ladder_score: p1.rating)
		p2.update(ladder_score: p2.rating)
		p1.save && p2.save 

	def self.update_war_scores(game_room, current_user)
		if current_user.guild.present_war_id != 0
			war = War.find(current_user.guild.present_war_id)
			guild1 = Guild.find_by(id: war.guild1_id)
			guild2 = Guild.find_by(id: war.guild2_id)
			if war.add_count_all == true || game_room.game_type == 'war' || game_room.game_type == 'war_time'
				winner = User.find(game_room.winner_id)
				guild1.isinwtgame = false
				guild2.isinwtgame = false
				if winner.guild_id == war.guild1_id
					war.guild1_score += 1
				else
					war.guild2_score += 1
				end
				war.save
				game_room.save
				guild1.save
				guild2.save
			end
		end
	end
end
