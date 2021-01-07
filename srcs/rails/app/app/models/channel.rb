class Channel < ApplicationRecord
	has_many :channel_users, dependent: :destroy #if user delete account all channel are deleted
	has_many :users, through: :channel_users
	has_many :messages, dependent: :destroy #if user delete account all messages are deleted

	validates :name, presence: true #make sure channel have name

	def self.channel_creation (channel_params, current_user)
		ChannelUser.create(user: current_user, channel_id: channel_params[:id], owner: true, admin: true)
		return true
	end
end
