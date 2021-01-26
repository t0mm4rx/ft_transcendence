module Api
	class WarsController < ApplicationController
		 before_action :set_guilds, only: [:create, :show, :destroy]
		 before_action :set_target, only: [:send_request]
		# before_action :set_target, only: [:send_request, :delete_member]
		def index
			#sort them by score from higher to lower
			render json: War.all
		end

		def create
			#@war = War.create(guild1: @guild1, guild2: @guild2, :start)
			@war = War.create(war_params)
			if @war.save
				render json: @war, status: :created
			else
				render json: @war.errors, status: :unprocessable_entity
			end
		end

		def update
			war = War.find_by(id: params[:id])
			war.update(war_params)
			if war.save
				render json: war, status: :created
			else
				render json: war.errors, status: :unprocessable_entity
			end
		end

		#send a request to war with a guild
		def send_request
			if @guild1.isinwar
				return render json: { error: "One war at a time bro! You are already in war"}, status: :unprocessable_entity
			elsif @guild2.isinwar
				return render json: { error: "One war at a time bro! The other guild are already in war"}, status: :unprocessable_entity
			end
			@guild2.war_invites = current_user.guild_id
		#	@guild1.war_invites = @guild2.id
			@guild2.save
		#	@guild1.save
			return render json: @guild2, status: :created
		end

		#current user can accept war invitation
		def accept_invitation
			if current_user.guild.war_invites != 0
				guild_inviter = Guild.find_by(id: current_user.guild.war_invites)
				current_user.guild.isinwar = true
				current_user.guild.war_invites = 0
				current_user.save
				guild_inviter.isinwar = true
				guild_inviter.war_invites = 0
				guild_inviter.save
				@war = War.create(guild1_id: current_user.guild_id, guild2_id: guild_inviter.id)
				if @war.save
					render json: @war, status: :created
				else
					render json: @war.errors
				end
			else
				return render json: { error: "You have no invitations to war bro!"}, status: :unprocessable_entity
			end
		end

		#current user can ignore invitation to war no params needed
		def ignore_invitation
			if current_user.guild.war_invites != 0
				current_user.guild.war_invites = 0
				current_user.save
				return render json: current_user.guild
			else
				return render json: { error: "You have no invitations to war bro!"}, status: :unprocessable_entity
			end
		end

		private
		def war_params
			params.permit(:guild1_id, :guild2_id, :start_date, :end_date, :wt_start, :wt_end, :wt_max_unanswers, :add_count_all, :guild1_score, :guild2_score, :prize)
		end

		def set_guilds
			@guild1 = Guild.find_by(id: params[:guild1_id])
			if @guild1.id != current_user.guild_id
				return render json: { error: "Guild1_id need to match current user guild id"}, status: :unprocessable_entity
			end
			@guild2 = Guild.find_by(id: params[:guild2_id])
		end

		def set_target
			@guild2 = Guild.find_by(id: params[:target_id])
			if @guild2.nil?
				return render json: { error: "This guild doesn't exist"}, status: :unprocessable_entity
			end
			@guild1 = current_user.guild
		end
	end
end
