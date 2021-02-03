class Tournament < ApplicationRecord
	has_many :tournament_users
	has_many :users, through: :tournament_users

	after_create :set_start_timer

	# register the timer
	def set_start_timer
		delay(:run_at => start_date). match_opponents
	end

	def match_opponents
		n_games = users.count / 2
		@games = []
		n_games.times do |index|
			game = GameRoom.new(player: users[index], opponent: users[index + n_games], tournament_id: id)
			@games.push(game) if game.save
			# @games.push({player: users[index], opponent: users[index + n_games], ladder: true })
		end
		@games
	end

	def calculate_new_game (user)
		existing = GameRoom.find_by(winner: nil, tournament_id: id)
		if tournament_users.where(eliminated: false).count > 1
			if existing
				existing.update(opponent: user)
			else
				GameRoom.new(player: user, tournament_id: id)
			end
		else
			winner = tournament_users.find_by(eliminated: false)
			winner.update_attribute(:title, title) if title
			update_attribute(:finished, true)
		end
	end
end
