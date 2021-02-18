class Tournament < ApplicationRecord
	has_many :tournament_users, dependent: :destroy
	has_many :users, through: :tournament_users
	has_many :game_rooms, dependent: :destroy

	after_create :set_start_timer

	# validates :start_date, presence: true
	# validates :registration_start, presence: true
	validates :name, presence: true, length: { minimum:2, maximum: 30}, format: {with: /\A[^`@;\$%\^*+]+\z/}
	validate :valid_dates, :on => :create

	# register the timer
	def set_start_timer
		Rufus::Scheduler.singleton.at start_date do
			start_tournament
		end
	end

	def games
		GameRoom.where(tournament_id: id)
	end

	def winner
		tournament_users.find_by(eliminated: false) if finished
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
		# @games = []
		n_games.times do |index|
			player = users[index]
			opponent = users[index + n_games]
			game = GameRoom.new(player: player, opponent: opponent, tournament_id: id)
			# @games.push(game) if game.save
			# todo: socket to each player
			if game.save && opponent
				GlobalChannel.send("game_request", opponent, player, game.id)
				GlobalChannel.send("game_request", player, opponent, game.id)
				# game.eliminate_if_no_answer
			end
		end
	end

	def calculate_new_game(winner)
		existing = game_rooms.find_by(opponent: nil)
		if tournament_users.where(eliminated: false).count > 1
			if existing
				existing.update(opponent: winner)
			else
				GameRoom.new(player: winner, tournament_id: id).save
			end
		else
			existing.destroy if existing
			# winner = tournament_users.find_by(eliminated: false)
			# winning_user = User.find(winner.user_id)
			winner.update_attribute(:title, title) if title
			update_attribute(:finished, true)
		end
	end

	def eliminate(loser)
		tournament_user = TournamentUser.find_by(tournament_id: id, user_id: loser.id)
		tournament_user.update_attribute(:eliminated, true)
	end

	private

	def valid_dates
		if !registration_start
			errors.add(:registration_start, "Registration start missing")
		elsif !start_date
			errors.add(:start_date, "Start date missing")
		elsif registration_start > start_date 
			errors.add(:registration_start, "Registration can't be after start")
		elsif start_date < DateTime.now
			errors.add(:start_date, "Start of tournament must be a future date")
		end
	end
end
