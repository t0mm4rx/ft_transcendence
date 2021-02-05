class Tournament < ApplicationRecord
	has_many :tournament_users
	has_many :users, through: :tournament_users

	after_create :set_start_timer

	# register the timer
	def set_start_timer
		delay(:run_at => start_date).start_tournament
	end

	def start_tournament
		if tournament_users.count < 2
			destroy
		else
			match_opponents
		end
	end

	def match_opponents
		n_games = users.count.odd? ? (users.count + 1) / 2 : users.count / 2
		@games = []
		n_games.times do |index|
			game = GameRoom.new(player: users[index], opponent: users[index + n_games], tournament_id: id)
			@games.push(game) if game.save
			# @games.push({player: users[index], opponent: users[index + n_games], ladder: true })
		end
		@file = File.open('TOURNAMENT_START.txt', 'w') do |file|
			file.puts "MATCHING OPPONENT FOR TOURNAMENT with id #{id}"
			file.p users
			file.puts "#{@games.count} GAMES CREATED"
			file.p @games
		end
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
