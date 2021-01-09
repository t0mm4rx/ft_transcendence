class ChannelSerializer < ActiveModel::Serializer
	attributes :id, :name, :private, :direct, :password #,:interlocutor

	def name
		return self.object.name unless self.object.direct
		arr = self.object.name.split(':')
		login = @instance_options[:current_user]
		arr[1] === login ? arr[2] : arr[1]
	end
end
