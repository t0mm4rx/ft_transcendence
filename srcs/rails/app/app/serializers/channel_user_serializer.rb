class ChannelUserSerializer < ActiveModel::Serializer
	attributes :id, :user_id, :username, :avatar, :channel_id, :channel_name, :admin, :banned, :muted, :owner, :ban_date, :mute_date
end
