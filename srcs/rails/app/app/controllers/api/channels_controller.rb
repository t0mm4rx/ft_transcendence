module Api
	class ChannelsController < ApplicationController
	before_action :set_channel, only: [:show, :update, :destroy]
	# GET /channels
	def index
		# @channels = Channel.all.order(:direct);
		@public = Channel.where(public: true, direct: false);
		@private = Channel.where(public: false, direct: false);
		@dms = current_user.channels.where(direct: true);
		@channels =  @public +  @private + @dms 

		# @channels = {
		# 	@channels = ActiveModelSerializers::SerializableResource.new(@public, 
		# 		{serializer: ChannelSerializer}).as_json;
		# 	private: render json: @private, current_user: current_user.login,
		# 	dms: render json: @dms, current_user: current_user.login
		# }

		render json: @channels, current_user: current_user.login
	end

	# GET /channels/1
	def show
		render json: @channel
	end

	# POST /channels
	#if channel name == login name then its a direct channel
	def create
		@channel = Channel.new(channel_params)
		if @other_user = User.find_by(login: params[:name])
			@channel.direct = true
			@channel.name = "DM:#{@other_user.login}:#{current_user.login}"
		elsif @channel.password.empty?
			# @channel.private = false
			@channel.public = true
			# @channel.direct = false
		else
			@channel.private = true
			@channel.public = false
		# 	@channel.direct = false
		end
		puts "CREATE CHANNEL ###########"
		p @channel
	if @channel.save
		Channel.channel_user_creation(@channel.id, current_user.id)
		if @channel.direct
			Channel.channel_user_creation(@channel.id, @other_user.id)
		end
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
		@channel = Channel.find(params[:id])
		if @channel.destroy
			render json: {}
		else
			render json: { error: @channel.errors }
		end
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
