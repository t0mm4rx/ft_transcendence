module Api
class ChannelUsersController < ApplicationController
	before_action :set_channel
	#create association between channels and users
	def index
		render json: @channel.channel_users
	end

	def create
	#	@channel.channel_users.where(user: current_user).first_or_create
		@channel.channel_users = Channel_users.new(channel_users_params)
		render json: @channel.channel_users, status: :created
	end

	def destroy
		@channel.channel_users.destroy_all
		head :no_content
	end

	private
	def set_channel
		@channel = Channel.find(params[:channel_id])
	end

	def channel_users_params
		params.permit(:channel_id, :user_id, :owner, :admin, :ban_date)
	end
end
end
