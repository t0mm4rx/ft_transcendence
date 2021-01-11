class UnreadsChannel < ApplicationCable::Channel

	# Connect to channel
	def subscribed
	  stream_for Channel.find(params[:id])
	   # stop_all_streams #when you subscribe stop other stream, so when you change channel its clear
	  #stream_for Channel.find(params["id"]) #start the listener
	  #@channel_user = current_user.channel_users.find_by(channel_id: params["id"])
	 #@channel = @channel_user.channel
	 stream_for @channel
	end

	# Disconnect from the channel
	def unsubscribed
	  # Any cleanup needed when channel is unsubscribed
	 # stop_all_streams
	end
  end