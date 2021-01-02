class Channel < ApplicationRecord
	has_many :channel_users, dependent: :destroy #if user delete account all channel are deleted
	has_many :users, through: :channel_users
	has_many :messages, dependent: :destroy #if user delete account all messages are deleted

	validates :name, presence: true #make sure channel have name
end
