class ChannelUserSerializer < ActiveModel::Serializer
	attributes :id, :user_id, :username, :avatar, :channel_id, :channel_name, :admin, :banned, :muted, :owner
	attribute :ban_date, if: :include_ban_date?
	attribute :mute_date, if: :include_mute_date?

	def include_ban_date?
		object.banned
	end
	def include_mute_date?
		object.muted
	end
end
