class GameRoom < ApplicationRecord
	belongs_to :player, class_name: :User
	belongs_to :opponent, class_name: :User, optional: true
	belongs_to :tournament, optional: true

	validates :player, presence: true

	after_initialize :set_defaults

	def game_over?
		player_score >= 11 || opponent_score >= 11
	end

	def winner
		if game_over?
			player_score > opponent_score ? player : opponent
		end
	end

	def update_scores
		if player_score > opponent_score
			player.has_won
			opponent.has_lost
		else
			opponent.has_won
			player.has_lost
		end
		calculate_new_user_score if self.ladder
	end

	# after a ladder game is finished we need to update the users' scores
	# for more info: https://github.com/mxhold/elo
	def calculate_new_user_score
		p1 = Elo::Player.new(rating: player.ladder_score)
		p2 = Elo::Player.new(rating: opponent.ladder_score)
		game = p1.versus(p2, result: player_score > opponent_score ? 1 : 0)
		player.update(ladder_score: p1.rating)
		opponent.update(ladder_score: p2.rating)
		player.save && opponent.save
	end

	def update_war_scores(current_user)
		if current_user.guild && current_user.guild.present_war_id != 0
			war = War.find(current_user.guild.present_war_id)
			guild1 = Guild.find_by(id: war.guild1_id)
			guild2 = Guild.find_by(id: war.guild2_id)
			if war.add_count_all == true || game_type == 'war' || game_type == 'war_time'
				# winner = User.find(winner_id)
				winner = player_score > opponent_score ? player : opponent
				guild1.isinwtgame = false
				guild2.isinwtgame = false
				if winner.guild_id == war.guild1_id
					war.guild1_score += 1
				else
					war.guild2_score += 1
				end
				war.save
				self.save
				guild1.save
				guild2.save
			end
		end
	end


	private

    def set_defaults
		self.player_score ||= 0
		self.opponent_score ||= 0
		self.number_player ||= opponent ? 2 : 1
	end
end
