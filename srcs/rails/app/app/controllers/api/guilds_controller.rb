module Api
	class GuildsController < ApplicationController
		before_action :set_guild, only: [:show, :update, :destroy]
		before_action :set_target, only: [:send_request]
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

		#send a request to a user without guild to join our guild, takes a target user in params
		def send_request
			p @target
			if current_user.guild_id && Guild.check_rights(current_user)
				if @target.guild_id
					return render json: { error: "This player already have a guild!"}, status: :unprocessable_entity
				end
				@target.guild_invites = current_user.id
				@target.save
				return render json: @target, status: :created
			else
				return render json: { error: "You don't have the rights bro!"}, status: :forbidden
			end
		end

		#current user can accept invitation to join guild
		def accept_invitation
			if current_user.guild_invites != 0
				inviter = User.find_by(id: current_user.guild_invites)
				@current_user.guild_locked = true
				@current_user.guild_id = inviter.guild_id
				@current_user.guild_invites = 0
				@current_user.save
				return render json: @current_user
			else
				return render json: { error: "You have no invitations to join a guild bro!"}, status: :unprocessable_entity
			end
		end

		#current user can ignore invitation to join guild, no params needed, just a  to /guilds/ignore_invitation'
		def ignore_invitation
			if current_user.guild_invites != 0
				@current_user.guild_invites = 0
				@current_user.save
				return render json: @current_user
			else
				return render json: { error: "You have no invitations to join a guild bro!"}, status: :unprocessable_entity
			end
		end

		private
		# Use callbacks to share common setup or constraints between actions.
		def set_guild
			@guild = Guild.find(params[:id])
		end

		def set_target
			@target = User.find_by(id: params[:target_id])
		end

		# Only allow a list of trusted parameters through.
		def guild_params
			params.permit(:name, :anagram)
		end
	end
end
