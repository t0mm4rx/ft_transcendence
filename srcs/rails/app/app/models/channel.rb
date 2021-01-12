class Channel < ApplicationRecord
	has_many :channel_users, dependent: :destroy #if user delete account all channel are deleted
	has_many :users, through: :channel_users
	has_many :messages, dependent: :destroy #if user delete account all messages are deleted

	validates :name, presence: true, uniqueness: { case_sensitive: false } #make sure channel have name

	def self.channel_user_creation (channel_id, current_user)
		cu = ChannelUser.create(user_id: current_user, channel_id: channel_id, owner: true, admin: true, ban_date: nil)
	end
	def self.channel_user_add (channel_id, current_user)
		cu = ChannelUser.create(user_id: current_user, channel_id: channel_id, owner: false, admin: false, ban_date: nil)
	end

	after_initialize :set_defaults

	def admins
		users.where(admin: true)
	end

	private

    def set_defaults
		self.direct ||= false
		self.private ||= false
		self.public ||= true
		self.password ||= ""
	end

end
