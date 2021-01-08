module Api
	class ChannelsController < ApplicationController
	before_action :set_channel, only: [:show, :update, :destroy]
	# GET /channels
	def index
	#	@channels = Channel.all
		#Channel.cu_channels(current_user)
		@channels = current_user.channels.order(:direct);

		render json: {}, status: :created
	end
	# GET /channels/1
	def show
		render json: @channel
	end

	# POST /channels
	#if channel name == login name then its a direct channel
	def create
		@channel = Channel.new(channel_params)
		if User.where(login: params[:name])
			@channel.direct = true
		end
		if @channel.password.empty?
			@channel.private = false
			@channel.public = true
			@channel.direct = false
		else
			@channel.private = true
			@channel.public = false
			@channel.direct = false
		end
	if @channel.save
		Channel.channel_user_creation(@channel.id, current_user.id)
		render json: @channel, status: :created
	else
		render json: @channel.errors, status: :unprocessable_entity
		end
	end

	# PATCH/PUT /channels/1
	# you should say in params if you want to
	#- change password: http://localhost:3000/api/channels/?new_password=password
	#- remove password: api/channels/?remove_password
	#- add password: api/channels/?add_change_password=password

	# PATCH/PUT /channels/1
	def update
		@cu = ChannelUser.find_by(user_id: current_user.id)
		if params.has_key?(:remove_password)
			if @cu != nil && @cu.owner == true
				@channel.public = true
				@channel.private = false
				@channel.password = nil
				@channel.save
			else
				error = "Only channel's owner can remove password"
			end
		elsif params.has_key?(:add_change_password)
			if @cu != nil && @cu.owner == true
				@channel.password = params[:add_change_password]
				@channel.private = true;
				@channel.public = false;
				@channel.save
			else
				error = "Only channel's owner can add or change password"
			end
		end

		if error
			render json: { error: error }, status: :unprocessable_entity
		else
			render json: @channel
		end
	end

	# DELETE /channels/1
	def destroy
		# @channel = Channel.find(params[:id])
		# if @channel.destroy
		# 	render json: {}
		# else
		# 	render json: { @channel.errore }
		# end
	end

	private
		# Use callbacks to share common setup or constraints between actions.
		def set_channel
			@channel = Channel.find(params[:id])
		end
		# Only allow a list of trusted parameters through.
		def channel_params
			params.permit(:name, :public, :private, :password, :direct)
		end
end
end
