class Tournament < ApplicationRecord
	has_many :tournament_users, dependent: :destroy
	has_many :users, through: :tournament_users
	has_many :game_rooms, dependent: :destroy

	after_create :set_start_timer

	validates :name, presence: true, length: { minimum:2, maximum: 30}, format: {with: /\A[^`@;\$%\^*+]+\z/}
	validate :valid_dates, :on => :create

	# register the timer
	def remaining_users
		tournament_users.where(eliminated: false)
	end

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
		tournament_user = tournament_users.find_by(user_id: winner.id)
		tournament_user.update_attribute(:wins, tournament_user.wins + 1)
		game = game_rooms.find_by(opponent: nil)
		if remaining_users.count > 1
			if game
				game.update_attribute(:opponent, winner)
				notify_players(game)
			else
				game = GameRoom.new(player: winner, tournament_id: id)
				game.save
			end
		else
			game.destroy if game
			winner.update_attribute(:title, title) if title
			update_attribute(:finished, true)
		end
	end

	### Don't want the tournaments to go on forever so a 
	### timer will call this to eliminate too slow users
	def game_timeout(id)
		game = GameRoom.find(id)
		if game.status == "notstarted" && game.number_player == 0 && game.player_score == 0 && game.opponent_score == 0 && !game.winner_id
			eliminate(game.opponent)
			eliminate(game.player)
			remaining = remaining_users
			if remaining.count <= 1
				User.find(remaining[0].user_id).update_attribute(:title, title) if remaining.count == 1
				update_attribute(:finished, true)
			end
		end
	end

	def notify_players(game)
		GlobalChannel.send("game_request", game.opponent, game.player, game.id)
		GlobalChannel.send("game_request", game.player, game.opponent, game.id)
		Rufus::Scheduler.singleton.in "15m" do
			game_timeout(game.id)
		end
	end

	def eliminate(loser)
		tournament_user = tournament_users.find_by(user_id: loser.id)
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
