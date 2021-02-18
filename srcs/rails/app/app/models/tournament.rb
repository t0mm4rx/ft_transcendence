class Tournament < ApplicationRecord
	has_many :tournament_users, dependent: :destroy
	has_many :users, through: :tournament_users
	has_many :game_rooms, dependent: :destroy

	after_create :set_start_timer

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
		n_games.times do |index|
			player = users[index]
			opponent = users[index + n_games]
			game = GameRoom.new(player: player, opponent: opponent, tournament_id: id)
			notify_players(game) if game.save && opponent
		end
	end

	def calculate_new_game(winner)
		game = game_rooms.find_by(opponent: nil)
		if tournament_users.where(eliminated: false).count > 1
			if game
				game.update(opponent: winner)
			else
				game = GameRoom.new(player: winner, tournament_id: id)
			end
			notify_players(game) if game.save
		else
			existing.destroy if existing
			winner.update_attribute(:title, title) if title
			update_attribute(:finished, true)
		end
	end

	def notify_players(game)
		GlobalChannel.send("game_request", game.opponent, game.player, game.id)
		GlobalChannel.send("game_request", game.player, game.opponent, game.id)
		Rufus::Scheduler.singleton.in "15m" do
			if game.status == "notstarted" && game.number_player == 0
				eliminate(game.opponent)
				eliminate(game.player)
				remaining = tournament_users.where(eliminated: false)
				if remaining.count < 2
					User.find(remaining[0].user_id).update_attribute(:title, title) if remaining.count == 1
					update_attribute(:finished, true)
				end
			end
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
