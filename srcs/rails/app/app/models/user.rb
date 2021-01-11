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

	belongs_to :guild, optional: true

	validates :username, presence: true, length: { minimum:2, maximum: 30}, uniqueness: { case_sensitive: false }
	validates :login, presence: true, length: { minimum:2, maximum: 30 }, uniqueness: { case_sensitive: false }
	validates :avatar_url, presence: true, length: { minimum:5, maximum: 255 } # format: { with: ConstantData::VALID_EMAIL_REGEX }

	after_initialize :set_defaults

	def friendships_
		Friendship.where("user_id = ? OR friend_id = ?", id, id)
	end

	def friends
		friendships_.filter_map do |friendship|
			if friendship.accepted
				friendship.user_id == id ? friendship.friend : friendship.user
			end
		end
	end

	def friends_with?(user)
		Friendship.accepted_record?(id, user.id)
	end

	def friendship_status(user)
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

	private

    def set_defaults
		self.wins ||= 0
		self.losses ||= 0
		self.admin ||= false
		self.online ||= false
		self.avatar_url ||= "https://cdn.intra.42.fr/users/small_#{self.login}.jpg"
		self.tfa ||= false
	end
end
