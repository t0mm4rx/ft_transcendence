module Api
class ChannelUsersController < ApplicationController
	before_action :set_channel
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
			render json: @channel_user.errors, status: :unprocessable_entity
		end
	end


	# PATCH/PUT /channels/:channel_id/:user_id
	#http://localhost:3000/api/channels/:channel_id/channel_users/?add_admin=user_id
	def update
        @admin = ChannelUser.find_by(user_id: current_user.id)

		if params.has_key?(:add_admin)
            @target = ChannelUser.find_by(user_id: params[:add_admin])
            if @target != nil && @admin != nil && @admin.owner == true
                @target.admin = true
                @target.save
            else
                error = "Only channel's owner can add admin"
            end

		#format param date = (yyyymmdd)
		elsif params.has_key?(:mute)
            @target = ChannelUser.find_by(user_id: params[:mute])
            if @target != nil && @admin != nil && @admin.admin == true
				@target.mute_date = params[:end]
            else
                error = "Only channel's admin can mute someone"
            end

		elsif params.has_key?(:ban)
            @target = ChannelUser.find_by(user_id: params[:ban])
            if @target != nil && @admin != nil && @admin.admin == true
                @target.ban_date = params[:end]
            else
                error = "Only channel's admin can ban someone"
            end
		end

        if error
            render json: error = {error: error}.to_json, status: :unprocessable_entity
        else
            render json: @target
        end

	end

	#add a params to delete a specific person, if its owner he's not owner anymore
	def destroy
		@channel.channel_users.destroy_all
		head :no_content
	end

	private
	def set_channel
		@channel = Channel.find(params[:channel_id])
	end

	def cu_params
		params.permit(:user_id, :channel_id, :owner, :admin, :ban_date, :mute_date)
	end
end
end
