module Api
	class GuildsController < ApplicationController
		before_action :set_guild, only: [:show, :update, :destroy]
		def index
			#sort them by score
			render json: Guild.all
		end

		def create
			if current_user.guild
				return render json: { error: "You already have a guild bro!"}, status: :forbidden
			@guild = Guild.new(guild_params)
		if @guild.save
			render json: @guild, status: :created
		else
			render json: @guild.errors, status: :unprocessable_entity
			end
		end

		private
		# Use callbacks to share common setup or constraints between actions.
		def set_guild
			@guild = Guild.find(params[:id])
		end
		# Only allow a list of trusted parameters through.
		def guild_param
			params.permit(:name, :anagram)
		end
	end
end
