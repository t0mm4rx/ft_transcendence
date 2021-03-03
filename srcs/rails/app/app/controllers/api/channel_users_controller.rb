module Api
class ChannelUsersController < ApplicationController
	before_action :set_channel
	before_action :set_channel_user, only: :update

	#create association between channels and users
	def index
		render json: @channel.channel_users
	end

	# GET /channels/:channel_id/:user_id
	def show
		@channel_user = ChannelUser.find_by(user_id: params[:id])
		render json: @channel_user
	end

	def create
		@channel_user = ChannelUser.new(cu_params)
		if @channel_user.save
			render json: @channel_user, status: :created
		else
			render json: { error: @channel_user.errors }, status: :unprocessable_entity
		end
	end

	# PATCH/PUT /channels/:channel_id/:user_id
	#http://localhost:3000/api/channels/:channel_id/channel_users/?add_admin=user_id

	def update
		# if admin of site -> allow to add channel owners
		if params.has_key?(:owner) && (@current_user.owner || @current_user.admin) 
			@channel_user.update(owner: params[:owner])
		end
		# if admin of site or of channel -> allowed to add admins
		if params.has_key?(:admin) && (@current_user.owner || @current_user.admin || @current_user_is_channel.owner)
			@channel_user.update(admin: params[:admin]) 
		end
		# if admin of channel -> allowed to mute/block
		if @current_user_is_channel.owner || @current_user_is_channel.admin
			@channel_user.update(bans_and_mutes)
		end
		if @channel_user.save
			render json: @channel_user
		else
			render json: @channel_user.errors, status: :unprocessable_entity
		end
	end

	#add a params to delete a specific person, if its owner he's not owner anymore
	def destroy		
		@user = @channel.channel_users.find_by(user_id: params[:id])
		if @user.user_id != current_user.id || @user.banned || @user.muted
			return render json: {}, status: :forbidden
		end
		if @user.destroy
			render json: {}
		else
			render json: @user.errors, status: :unprocessable_entity
		end
	end

	private
	def set_channel
		@channel = Channel.find(params[:channel_id])
	end
	def set_channel_user
		@channel_user = ChannelUser.find(params[:id])
		@current_user_is_channel = @channel.channel_users.find_by(user_id: current_user.id)
	end

	def cu_params
		params.permit(:user_id, :channel_id, :owner, :admin, :ban_date, :mute_date)
	end

	def bans_and_mutes
		params.permit(:ban_date, :mute_date)
	end
end
end
