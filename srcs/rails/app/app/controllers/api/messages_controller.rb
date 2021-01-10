module Api
	class MessagesController < ApplicationController
	before_action :set_channel
	before_action :check_ban
	before_action :validate_user

	def index
		@blocked_list = BlockedUser.cu_blocked_list(current_user)
		puts "LIST BLOCKED LIST IN MESSAGE INDEX ##############################################################"
		current_user.blocked_ids
		# @msgs = @channel.messages
		# @msg_clean = @msgs.select { |msg| msg.user_id != current_user.blocked_ids }
		# #p @msgs.user_id
		# p @messages.user_id
		puts "LIST BLOCKED  =======================##############################################################"
		p current_user.blocked_ids
		p @new_msg = Message.where.not(user_id: current_user.blocked_ids)
		#render json: @channel.messages
		render json: @new_msg
	end

	def create
		@cu = @channel.channel_users.find_by(user_id: current_user.id)
		if @cu.mute_date != nil && @cu != nil
			if @cu.mute_date > DateTime.now
				return render json: error = {error: "You are mute until #{@cu.mute_date}"}.to_json
			end
		end
		@message = @channel.messages.create(message_params)
		MessageChannel.broadcast_to @channel, message: params['body'], date: @message.date, login: current_user['username']
		if @message.save
			render json: @message, status: :created
		else
			render json: @message.errors, status: :unprocessable_entity
		end
	end

	private
	def set_channel
		@channel = Channel.find(params[:channel_id])  #maybe add some check later like "channel = current_user.channels.find(params[:channel_id])" so only member of channel can post messages, but not now because its not practical to test API
	end

	def validate_user
		password = params.fetch('password', "")
		join = params.fetch('join', false)
		user_registered = @channel.users.find(current_user.id) rescue nil
		unless user_registered
			if join && (!@channel.private || @channel.password == password)
				Channel.channel_user_add(@channel.id, current_user.id)
			else
				puts "JOIN #############################"
				p join
				message = "password"
				message = "join" if join === true;
				return render json: message, status: :unauthorized
			end
		end
	end

	def check_ban
		@cu = @channel.channel_users.find_by(user_id: current_user.id) rescue nil
		if @cu.ban_date != nil && @cu != nil
			if @cu.ban_date > DateTime.now
				return render json: error = {error: "You are ban until #{@cu.ban_date}"}.to_json, status: :forbidden
			end
		end
	end

	def message_params
		params.permit(:body, :channel_id).merge(user: current_user) #force the user to be the current user to avoid using other account to send messages
	end
end
end
