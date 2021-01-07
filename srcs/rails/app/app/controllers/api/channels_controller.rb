module Api
	class ChannelsController < ApplicationController

	before_action :set_channel, only: [:show, :update, :destroy]
	# GET /channels
	def index
		@channels = Channel.all
		render json: @channels
	end
	# GET /channels/1
	def show
		render json: @channel
	end



	# POST /channels
	def create
		@channel = Channel.new(channel_params)
	if @channel.save
		Channel.channel_user_creation(@channel.id, current_user)
		render json: @channel, status: :created
	else
		render json: @channel.errors, status: :unprocessable_entity
		end
	end

	# PATCH/PUT /channels/1
	def update
	if @channel.update(channel_params[:id])
		render json: @channel
	  else
		render json: @channel.errors, status: :unprocessable_entity
		end
	end
	# DELETE /channels/1
	def destroy
		@channel.destroy
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
