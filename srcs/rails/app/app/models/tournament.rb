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
		puts "MATCH OPPONENTS CALLED ##################################################"
		n_games = users.count.odd? ? (users.count + 1) / 2 : users.count / 2
		@games = []
		n_games.times do |index|
			game = GameRoom.new(player: users[index], opponent: users[index + n_games], tournament_id: id)
			@games.push(game) if game.save
			# @games.push({player: users[index], opponent: users[index + n_games], ladder: true })
		end
		@file = File.open("TOURNAMENT_#{name}.txt", 'w') do |file|
			file.puts "MATCHING OPPONENT FOR TOURNAMENT with id #{id}"
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
