class ChannelSerializer < ActiveModel::Serializer
	attributes :id, :name, :private, :direct, :password, :admin, :owner

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
end
