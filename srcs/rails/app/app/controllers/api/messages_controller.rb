module Api
	class MessagesController < ApplicationController
	before_action :set_channel

	def index
		render json: @channel.messages
	end

	def create
		@message = @channel.messages.create(message_params)
		MessageChannel.broadcast_to @channel, message: params['body']['date'], login: current_user['username']
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

	def message_params
		params.permit(:body).merge(user: current_user) #force the user to be the current user to avoid using other account to send messages
	end

	end
end
