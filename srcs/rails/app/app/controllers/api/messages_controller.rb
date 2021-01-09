module Api
	class MessagesController < ApplicationController
	before_action :set_channel
	before_action :check_ban
	before_action :validate_user

	def index
		render json: @channel.messages
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
		user_registered = @channel.users.find(current_user.id) rescue nil
		unless user_registered
			if !@channel.private || @channel.password == password
				Channel.channel_user_add(@channel.id, current_user.id)
			else
				return render json: {}, status: :unauthorized
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
