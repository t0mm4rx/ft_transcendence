module Api
class ChannelUsersController < ApplicationController
	before_action :set_channel
	#create association between channels and users
	def index
		render json: @channel.channel_users
	end

	def create
		@channel_user = ChannelUser.create(user_id: current_user.id, channel_id: params[:channel_id], owner: params[:owner], admin: params[:admin], ban_date: params[:ban_date]);
		# @channel.channel_users.where(user: current_user, owner: params[:owner]).first_or_create
	#	@channel.channel_users.where(channel_id: params[:channel_id], user_id: params[:user_id], owner: params[:owner], admin: params[:admin], ban_date: params[:ban_date]).create
		# @cu = ChannelUser.new(cu_params)
		if @channel_user.save
			render json: @channel_user, status: :created
		else
			render json: @channel_user.errors, status: :unprocessable_entity
		end
	end

	def destroy
		@channel.channel_users.destroy_all
		head :no_content
	end

	private
	def set_channel
		@channel = Channel.find(params[:channel_id])
	end

	def cu_params
		#params.permit(:channel_id, :user_id, :owner, :admin, :ban_date)
		params.permit(:channel_id, :user_id, :owner, :admin, :ban_date)
	end
end
end
