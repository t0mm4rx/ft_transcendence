class ChannelSerializer < ActiveModel::Serializer
	attributes :id, :name, :public, :private, :direct #,:interlocutor
end
