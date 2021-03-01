class Channel < ApplicationRecord
	has_secure_password #password encryption in DB

	has_many :channel_users, dependent: :destroy #if user delete account all channel are deleted
	has_many :users, through: :channel_users
	has_many :messages, dependent: :destroy #if user delete account all messages are deleted

	validates :name, presence: true, length: { minimum:2, maximum: 30}, uniqueness: { case_sensitive: false }, format: {with: /\A[^`@;\$%\^*+]+\z/}

	def self.channel_user_creation (channel_id, current_user)
		cu = ChannelUser.create(user_id: current_user, channel_id: channel_id, owner: true, admin: true, ban_date: nil)
	end
	def self.channel_user_add (channel_id, current_user)
		cu = ChannelUser.create(user_id: current_user, channel_id: channel_id, owner: false, admin: false, ban_date: nil)
	end

	after_initialize :set_defaults
	validate :unique_dm, :on => :create

	def admins
		users.where(admin: true)
	end

	private

	def unique_dm
		if direct == true
			arr = name.split(':')
			flipped_name = "#{arr[0]}:#{arr[2]}:#{arr[1]}"
			if Channel.find_by(name: flipped_name) 
				errors.add(:name, "channel already exists")
			end
		end
	end

    def set_defaults
		self.direct ||= false
		self.private ||= false
		self.public ||= true
		self.password ||= ""
	end

end
