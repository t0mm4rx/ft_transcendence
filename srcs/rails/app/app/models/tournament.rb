class Tournament < ApplicationRecord
	has_many :tournament_users
	has_many :users, through: :tournament_users

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
			player = users[index]
			opponent = users[index + n_games]
			game = GameRoom.new(player: player, opponent: opponent, tournament_id: id, status: "created", number_player: 0)
			@games.push(game) if game.save
			# todo: socket to each player
			if (opponent)
				content = {}
				content['request_to'] = player.id
				content['from'] = {}
				content['from']['id'] = opponent.id
				content['from']['login'] = opponent.login
				GlobalChannel.broadcast_to "global_channel", sender: opponent.id, message: "game_request", content: content
				content['request_to'] = opponent.id
				content['from']['id'] = player.id
				content['from']['login'] = player.login
				GlobalChannel.broadcast_to "global_channel", sender: player.id, message: "game_request", content: content
			end
		end
	end

	def calculate_new_game (user)
		existing = GameRoom.find_by(winner_id: nil, tournament_id: id)
		if tournament_users.where(eliminated: false).count > 1
			if existing
				existing.update(opponent: user)
			else
				GameRoom.new(player: user, tournament_id: id)
			end
		else
			winner = tournament_users.find_by(eliminated: false)
			winner = User.find(winner.user_id)
			winner.update_attribute(:title, title) if title
			update_attribute(:finished, true)
		end
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
