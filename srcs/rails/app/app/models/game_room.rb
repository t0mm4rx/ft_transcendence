class GameRoom < ApplicationRecord
	belongs_to :player, class_name: :User
	belongs_to :opponent, class_name: :User, optional: true
	belongs_to :tournament, optional: true

	validates :player, presence: true

	after_initialize :set_defaults

	def game_over?
		status == "ended" || player_score >= 11 || opponent_score >= 11
	end

	def winner
		if game_over?
			player_score > opponent_score ? player : opponent
		end
	end

	def update_scores
		set_winner_and_loser
		@winner.has_won
		@loser.has_lost
		calculate_new_user_score if self.ladder
		update_tournament if tournament
	end

	def update_tournament
		tournament.calculate_new_game(@winner)
		eliminate_loser
	end

	def eliminate_loser
		tournament_user = TournamentUser.find_by(tournament_id: tournament.id, user_id: @loser.id)
		tournament_user.update_attribute(:eliminated, true)
	end

	def check_no_show
		if number_player == 1
			@no_show = true
			update_scores
		end
	end

	def declined(user)
		status = user == opponent ? "player" : "opponent"
		update_attribute(:status, status)
		@no_show = true
		update_scores
	end

	def accepted_by(user)
		status = "notstarted"
		n_player = number_player + 1
		if tournament
			status = user === player ? "player" : "opponent"
			if n_player == 1
				Rufus::Scheduler.singleton.in "3m" do
					check_no_show
				end
			elsif n_player == 2
				status = "everyone_ready"		
			end
		end
		update(number_player: n_player, status: status, accepted: true)
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
		if current_user.guild && current_user.guild.present_war_id
			war = War.find(current_user.guild.present_war_id)
			guild1 = Guild.find_by(id: war.guild1_id)
			guild2 = Guild.find_by(id: war.guild2_id)
			if war.add_count_all == true || self.game_type == 'war' || self.game_type == 'war_time'
				guild1.isinwtgame = false
				guild2.isinwtgame = false
				if @winner.guild_id == war.guild1_id
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
		self.accepted ||= false
		self.player_score ||= 0
		self.opponent_score ||= 0
		# self.number_player ||= opponent ? 2 : 1
		self.number_player ||= 0
	end

	def set_winner_and_loser
		if game_over?
			@winner = player_score > opponent_score ? player : opponent
			@loser = player_score < opponent_score ? player : opponent
			update_attribute(:winner_id, @winner.id)
		elsif @no_show
			@winner = status == "player" ? player : opponent
			@loser = status == "player" ?  opponent : player
			update_attribute(:winner_id, @winner.id)
			update_attribute(:status, "ended")
		end
	end
end
