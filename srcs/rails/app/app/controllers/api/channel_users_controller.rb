module Api
class ChannelUsersController < ApplicationController
	before_action :set_channel
	#create association between channels and users
	def index
		render json: @channel.users
	end

	def create
		@channel.channel_users.where(user: current_user).first_or_create
		render json: @channel.channel_users, status: :created
	end

	def destroy
		@channel.channel_users.where(user: current_user).destroy_all
		head :no_content
	end

	private
	def set_channel
		@channel = Channel.find(params[:channel_id])
	end
end
end
