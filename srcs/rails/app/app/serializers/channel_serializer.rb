class ChannelSerializer < ActiveModel::Serializer
    # has_many :cu_channels #:current_user_channels, :name #:interlocutor
	attributes :name, :public, :private, :direct#, :interlocutor
	# def channel_name
	# {
	# 	channel_name: @channel.name
	# }
	# end

	# def user
	# {
	# 	user_id: current_user.id,
	# 	login: current_user.login,
	# 	avatar_url: current_user.avatar_url
	# }
	#end
#     def interlocutor
#     #  @channel.channel_users(find_by)
#     #list users in channel
#     #choose the one different from current.user
#     end
end
