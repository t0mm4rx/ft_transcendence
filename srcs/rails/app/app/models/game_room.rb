class GameRoom < ApplicationRecord
	belongs_to :player, class_name: :User
	belongs_to :opponent, class_name: :User, optional: true
	belongs_to :tournament, optional: true

	validates :player, presence: true
	validate :same_unstarted_exists, :on => :create

	after_initialize :set_defaults

	def game_over?
		status == "ended" || player_score >= 11 || opponent_score >= 11
	end

	def update_scores(loser)
		@loser = loser if loser
		set_winner_and_loser
		calculate_new_user_score if self.ladder
		if tournament
			tournament.eliminate(@loser)
			tournament.calculate_new_game(@winner)
		end
		update_war_scores
	end

	def set_no_show(user)
		if number_player != 2 && status == "notstarted" && player_score == 0 && opponent_score == 0 && !winner_id
			update_scores(user)
		end
	end

	def accepted_by(user)
		if tournament
			other = user === player ? opponent : player
			if number_player === 0 #status == "created"
				Rufus::Scheduler.singleton.in "3m" do
					set_no_show(other)
				end
			end
			update(accepted: (number_player >= 1))
		elsif user === opponent
			update(accepted: true)
		end
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

	def update_war_scores
		if (player.guild && opponent.guild && 
			player.guild.present_war_id && 
			player.guild.present_war_id === opponent.guild.present_war_id)
			war = War.find(player.guild.present_war_id)
			if war.add_count_all == true || self.game_type == 'war' || self.game_type == 'war_time'
				player.guild.update_attribute(:isinwtgame, false)
				opponent.guild.update_attribute(:isinwtgame, false)
				@winner.guild_id == war.guild1_id ? war.guild1_score += 1 : war.guild2_score += 1
				war.save
			end
		end
	end

	private

    def set_defaults
		self.accepted ||= false
		self.player_score ||= 0
		self.opponent_score ||= 0
		self.number_player ||= 0
		self.status ||= "notstarted"
	end

	def set_winner_and_loser
		if @loser
			@winner = @loser == player ? opponent : player
		else
			@winner = player_score > opponent_score ? player : opponent
			@loser = @winner == opponent ? player : opponent
		end
		update_attribute(:winner_id, @winner.id)
		update_attribute(:status, "ended")
		@winner.has_won
		@loser.has_lost
	end

	def same_unstarted_exists
		if GameRoom.find_by(ladder: ladder, player: player, opponent: opponent, status: "notstarted", accepted: false)
			errors.add(:id, "game already exists")
		end
	end
end
