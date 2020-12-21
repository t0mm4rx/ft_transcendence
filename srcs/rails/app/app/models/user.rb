class User < ApplicationRecord
	validates :username, presence: true, length: {minimum: 3}
	validates :login, presence: true, length: {minimum: 3}
	validates :avatar, presence: true, length: {minimum: 3}
end
