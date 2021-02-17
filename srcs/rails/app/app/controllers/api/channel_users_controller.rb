module Api
class ChannelUsersController < ApplicationController
	before_action :set_channel
	before_action :set_channel_user, only: :update
	before_action :validate_rights, only: :update
	before_action :validate_no_collision, only: :update
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
		if @channel_user.save!
			render json: @channel_user, status: :created
		else
			render json: {error: @channel_user.errors }, status: :unprocessable_entity
		end
	end

	# PATCH/PUT /channels/:channel_id/:user_id
	#http://localhost:3000/api/channels/:channel_id/channel_users/?add_admin=user_id
	def update
		puts "UPDATE   ################"
		p params
		# @channel_user = @channel.channel_users.find_by(params[:user_id])

		@channel_user.update(channel_user_params)
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
	# def destroy
	# 	@channel.channel_users.destroy_all
	# 	head :no_content
	# end

	private
	def set_channel
		@channel = Channel.find(params[:channel_id])
	end
	def set_channel_user
		@channel_user = ChannelUser.find(params[:id])
	end

	def cu_params
		params.permit(:user_id, :channel_id, :owner, :admin, :ban_date, :mute_date)
	end

	def validate_rights 
		@current_channel_user = @channel.channel_users.find_by(user_id: current_user.id)

		if @current_channel_user.owner

		elsif @current_channel_user.admin
			if (params.has_key?(:admin) || params.has_key?(:owner)) && !@current_user.admin
				return render json: {error: "Only an admin or channel's owner can add admins and owners"}, status: :forbidden
			end
		elsif @current_user.admin
			if params.has_key?(:banned) ||params.has_key?(:muted)
				return render json: {error: "Only a channel's admins or owners can mute others"}, status: :forbidden
			end
		else
			return render json: {error: "You don't have the rights to change the channel's permissions"}, status: :forbidden
		end
	end

	def validate_no_collision
		@target = User.find(@channel_user.user_id)

		if params[:owner] == true || params[:admin] == true 
			if @channel_user.banned || @channel_user.muted
				return render json: {error: "Need to remove mute or ban before turning user into admin or owner"}, status: :forbidden
			end
		end
		# if params[:banned] == true || params[:muted] == true 
		# if params.has_key?(:banned) || params.has_key?(:muted)
		if params.has_key?(:ban_date) || params.has_key?(:mute_date)
			if @target.admin || @channel_user.admin || @channel_user.owner
				return render json: {error: "Slow down bro, you cannot ban the owner or admins"}, status: :forbidden
			end
		end
	end


	def channel_user_params
		if current_user.admin || @channel.channel_users.find_by(user_id: current_user.id, owner: true)
			params.permit(:user_id, :channel_id, :owner, :admin, :ban_date, :mute_date)
		elsif @channel.channel_users.find_by(user_id: current_user.id, admin: true)
			params.permit(:user_id, :channel_id, :ban_date, :mute_date)
		end
	end
end
end
