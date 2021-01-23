module Api
	class GuildsController < ApplicationController
		before_action :set_guild, only: [:show, :update, :destroy]
		def index
			#sort them by score
			render json: Guild.all
		end

		def create
			if current_user.guild_id
		 		return render json: { error: "You already have a guild bro!"}, status: :forbidden
			end
			@guild = Guild.new(guild_params)
			if @guild.save
				current_user.guild_id = @guild.id
				current_user.guild_owner = true
				current_user.save
				render json: @guild, status: :created
			else
				render json: @guild.errors, status: :unprocessable_entity
			end
		end

		def destroy
			if current_user.guild_id && Guild.check_rights(current_user)
				@guild = Guild.find(params[:id])
				if @guild.destroy
					render json: {}
				else
					render json: { error: @guild.errors }
				end
			else
				return render json: { error: "You don't have the rights bro!"}, status: :forbidden
			end
		end


		# def send_request
		# 	if
		# end

		private
		# Use callbacks to share common setup or constraints between actions.
		def set_guild
			@guild = Guild.find(params[:id])
		end

		# Only allow a list of trusted parameters through.
		def guild_params
			params.permit(:name, :anagram)
		end
	end
end
