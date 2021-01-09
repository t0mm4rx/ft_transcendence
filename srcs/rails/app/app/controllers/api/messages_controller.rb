module Api
	class MessagesController < ApplicationController
	before_action :set_channel
	before_action :validate_user

	def index
		render json: @channel.messages
	end

	def create
		@message = @channel.messages.create(message_params)
		# MessageChannel.broadcast_to @channel, message: params['body'], login: current_user['username']
		MessageChannel.broadcast_to @channel, message: params['body'], date: @message.date, login: current_user['username']
		#message: message_params['body']['username']
	#	UnreadsChannel.broadcast_to @channel, {} #ping to say that we received a non read message, so in the front add when data is received set up title as bold or red notif
		if @message.save
			render json: @message, status: :created
		else
			render json: @message.errors, status: :unprocessable_entity
		end
	end

	private
	def set_channel
		@channel = Channel.find(params[:channel_id])  #maybe add some check like "channel = current_user.channels.find(params[:channel_id])" so only member of channel can post messages
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
	
	def message_params
		params.permit(:body).merge(user: current_user) #force the user to be the current user to avoid using other account to send messages
	end

	end
end
