class User < ApplicationRecord
	has_secure_password #password encryption in DB
	has_one_time_password #TFA

	has_many :pending_friends, -> {where accepted: false}, class_name: 'Friendship'
	has_many :pending_requests, -> {where accepted: false}, class_name: 'Friendship', foreign_key: "friend_id"
	has_many :friendships_user, class_name: 'Friendship', dependent: :destroy
	has_many :friendships_friend, class_name: 'Friendship', foreign_key: "friend_id", dependent: :destroy


	has_many :channel_users, dependent: :destroy
	has_many :channels, through: :channel_users
	has_many :messages, dependent: :destroy

	has_many :game_pending_requests, -> {where accepted: false}, class_name: 'GameRequest', foreign_key: "opponent_id"
	has_many :pending_games, -> {where accepted: false}, class_name: 'GameRoom', foreign_key: "opponent_id"
	has_many :game_player, class_name: 'GameRoom', foreign_key: "player_id", dependent: :destroy
	has_many :game_opponent, class_name: 'GameRoom', foreign_key: "opponent_id", dependent: :destroy

	has_many :blocked, class_name: 'BlockedUser', dependent: :destroy

	belongs_to :guild, optional: true

	validates :username, presence: true, length: { minimum:2, maximum: 30}, uniqueness: { case_sensitive: false }, format: {with: /\A[^`@;#\$%\^&*+=]+\z/}
	validates :login, presence: true, length: { minimum:2, maximum: 30 }, uniqueness: { case_sensitive: false }#, format: {with: /\A[a-z]+\z/}
	validates :avatar_url, presence: true, length: { minimum:5, maximum: 255 }#, format: URI::regexp(%w[http https])

	# validates_format_of :username, :with => /\A[^0-9`!@#\$%\^&*+_=]+\z/


	validate :first_is_admin, :on => :create
	# has_many :games, class_name: 'GameRoom'

	after_initialize :set_defaults

	def games
		# GameRoom.where("player_id = ? OR opponent_id = ?", id, id)
		game_player + game_opponent
	end

	# def pending_games
	# 	# games.where(accepted: false)
	# 	# GameRoom.where(accepted: nil).update_all(accepted: false)
	# 	# GameRoom.where(accepted: false, opponent_id: id) + GameRoom.where(accepted: false, player_id: id) 
	# end

	def friendships
		Friendship.where("user_id = ? OR friend_id = ?", id, id)
	end

	def friends
		friendships.filter_map do |friendship|
			if friendship.accepted
				friendship.user_id == id ? friendship.friend : friendship.user
			end
		end
	end

	def friends_with?(user)
		Friendship.accepted_record?(id, user.id)
	end

	def relation_to(user)
		return "current_user" if id == user.id
		friendship = Friendship.find_record(id, user.id)
		return nil if !friendship
		return "friends" if friendship.accepted
		friendship.user_id === id ? "request sent" : "request recv"
	end

	def send_request(user)
		Friendship.create(user_id: id, friend_id: user.id)
	end

	def accept_friend(user)
		Friendship.find_by(user_id: user.id, friend_id: id).update(accepted: true)
		# Friendship.find_record(id, user.id).update(accepted: true)
	end

	def remove_request(user)
		Friendship.find_record(id, user.id).destroy
	end

	def self.set_first_admin(user)
		if user != nil && user.id == 1
			user.admin = true
		end
	end

	# def guild
	# 	friendships_.filter_map do |friendship|
	# 		if friendship.accepted
	# 			friendship.user_id == id ? friendship.friend : friendship.user
	# 		end
	# 	end
	# end

	def banned
		return false if !banned_until
		banned_until > DateTime.now
	end

	def has_won
		update(wins: wins + 1)
		save
	end

	def has_lost
		update(losses: losses + 1)
		save
	end

	def find_higher_ranked_user
		# User.where("online = true AND ladder_score > ?", ladder_score).order(ladder_score: :asc).first
		User.where("id != ? AND ladder_score >= ?", id, ladder_score).order(ladder_score: :asc).first
	end

	private

	def first_is_admin
		update_attribute(:admin, true) if User.count(:all) < 2
	end

    def set_defaults
		# self.ladder_score ||= 1000
		self.wins ||= 0
		self.losses ||= 0
		self.admin ||= false
		self.online ||= false
		self.avatar_url ||= "https://cdn.intra.42.fr/users/small_#{self.login}.jpg"
		self.tfa ||= false
		self.guild_id ||= nil
		self.guild_owner ||= false
		self.guild_officer ||= false
		self.guild_locked ||= false
		self.guild_invites ||= 0
	end
end
