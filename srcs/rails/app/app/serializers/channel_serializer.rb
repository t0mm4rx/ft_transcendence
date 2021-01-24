class ChannelSerializer < ActiveModel::Serializer
	attributes :id, :name, :private, :direct, :password, :admin, :owner
	attribute :avatar, if: :is_direct?
	def owner
		self.object.channel_users.find_by(user: current_user, owner: true) != nil
	end
	def admin
		self.object.channel_users.find_by(user: current_user, admin: true) != nil
	end
	def name
		return self.object.name unless self.object.direct
		arr = self.object.name.split(':')
		arr[1] === current_user.login ? arr[2] : arr[1]
	end
	def avatar
		users = self.object.users 
		users[0] === current_user ? users[1].avatar_url : users[0].avatar_url
	end
	def is_direct?
		object.direct
	end
end
