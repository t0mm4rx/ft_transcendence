module Api
	class WarsController < ApplicationController
		 before_action :set_guilds, only: [:create, :show, :destroy]
		 before_action :set_target, only: [:send_request]
		 before_action :set_guilds_update, only: [:update, :wt_game_invite, :wt_game_accept]
		 before_action :check_if_wt_unanswered, only: [:index, :show]
		 before_action :check_if_war_end, only: [:index, :show, :wt_game_invite, :wt_game_accept]

		def index
			render json: War.all
		end

		def create
			@war = War.create(war_params)
			if @war.save
				render json: @war, status: :created
			else
				render json: @war.errors, status: :unprocessable_entity
			end
		end

		def update
			@war.update(war_params)
			if @war.save
				render json: @war, status: :created
			else
				render json: @war.errors, status: :unprocessable_entity
			end
		end

		#send a request to war with a guild
		def send_request
			if @guild2.id == current_user.guild_id
				return render json: { error: "You cannot declare a war to your guild bro!"}, status: :unprocessable_entity
			elsif @guild1.isinwar
				return render json: { error: "One war at a time bro! You are already in war"}, status: :unprocessable_entity
			elsif @guild2.isinwar
				return render json: { error: "One war at a time bro! The other guild are already in war"}, status: :unprocessable_entity
			end
			@war = War.create(guild1_id: current_user.guild_id, guild2_id: @guild2.id)
			if @war.save
				@guild2.war_invites = current_user.guild_id
				@guild2.war_invite_id = @war.id
				@guild2.save
				@war.update(war_params)
				render json: @war, status: :created
			else
				render json: @war.errors
			end
		end

		#current user can accept war invitation
		def accept_invitation
			if current_user.guild && current_user.guild.war_invites != 0
				@war = War.find(params[:id])
				if @war.nil?
				 	return render json: { error: "War id doesn't exist"}, status: :unprocessable_entity
				elsif @war.accepted == true
					return render json: { error: "War is already accepted"}, status: :unprocessable_entity
				else
					guild_inviter = Guild.find_by(id: current_user.guild.war_invites)
					current_user.guild.isinwar = true
					current_user.guild.war_invites = 0
					current_user.guild.war_invite_id = 0
					guild_inviter.isinwar = true
					guild_inviter.war_invites = 0
					guild_inviter.war_invite_id = 0
					@war.accepted = true
					if @war.save
						guild_inviter.present_war_id = @war.id
						current_user.guild.present_war_id = @war.id
						guild_inviter.save
						current_user.guild.save
						render json: @war, status: :created
					else
						render json: @war.errors
					end
				end
			else
				return render json: { error: "You have no invitations to war bro!"}, status: :unprocessable_entity
			end
		end

		#current user can ignore4 invitation to war no params needed
		def ignore_invitation
			if current_user.guild && current_user.guild.war_invites != 0
				current_user.guild.war_invites = 0
				current_user.guild.war_invite_id = 0
				current_user.guild.save
				return render json: current_user.guild
			else
				return render json: { error: "You have no invitations to war bro!"}, status: :unprocessable_entity
			end
		end

		#the game invite is sending a request to all the member of the guild adverse to play a game
		def wt_game_invite
			if War.check_if_war_time(@war) == false
				return render json: { error: "It's not war time bro!"}, status: :unprocessable_entity
			elsif current_user.guild.wt_game_invite != 0 || @enemy.wt_game_invite != 0
				return render json: { error: "There is already a war time invitation pending between you, it's not useful to send a new one!"}, status: :unprocessable_entity
			elsif current_user.guild.isinwtgame == true
				return render json: { error: "Your guild is already in a war time game bro!"}, status: :unprocessable_entity
			else
				@enemy.wt_game_invite = current_user.id
				@enemy.wt_date_to_answer = DateTime.now + @war.wt_time_to_answer
				@enemy.save
				return render json: @enemy, status: :created
			end
		end

		#the game accept is accepting the war time game invitation
		def wt_game_accept
			if current_user.guild.wt_game_invite == 0
				return render json: { error: "You don't have any war time game invitation"}, status: :unprocessable_entity
			elsif War.check_if_war_time(@war) == false
					return render json: { error: "It's not war time bro!"}, status: :unprocessable_entity
			elsif current_user.guild.isinwtgame == true
				return render json: { error: "Your guild is already in a war time game bro!"}, status: :unprocessable_entity
			else #add a condition where the inviter have to stay online until the time to answer, otherwise he loose?
				opponent = User.find_by(id: current_user.guild.wt_game_invite)
				game_room = GameRoom.create(player: current_user.id, opponent: opponent.id, status: "notstarted", number_player: 2, game_type: "war_time")
				current_user.guild.wt_game_invite = 0
				current_user.guild.isinwtgame = true
				opponent.guild.isinwtgame = true
				current_user.guild.save
				opponent.guild.save
				return render json: game_room, status: :created
			end
		end

		private
		def war_params
			params.permit(:guild1_id, :guild2_id, :start_date, :end_date, :wt_start, :wt_end, :wt_max_unanswers, :wt_time_to_answer, :add_count_all, :guild1_score, :guild2_score, :prize)
		end

		def game_params
			params.permit(:player, :opponent, :status, :number_player)
		end

		def set_guilds
			@guild1 = Guild.find_by(id: params[:guild1_id])
			if @guild1.id != current_user.guild_id
				return render json: { error: "Guild1_id need to match current user guild id"}, status: :unprocessable_entity
			end
			@guild2 = Guild.find_by(id: params[:guild2_id])
		end

		def set_guilds_update
			@war = War.find_by(id: params[:id])
			if @war.nil?
				return render json: { error: "You have no war"}, status: :unprocessable_entity
			end
			if @war.war_closed == true
				return render json: { error: "War is closed !"}, status: :unprocessable_entity
			end
			@guild1 = Guild.find_by(id: @war.guild1_id)
			@guild2 = Guild.find_by(id: @war.guild2_id)
			if current_user.guild_id == @guild1.id
				@enemy = @guild2
			else
				@enemy = @guild1
			end
		end

		def set_target
			@guild1 = Guild.find_by(id:current_user.guild_id)
			@guild2 = Guild.find_by(id: params[:target_id])
			if @guild2.nil?
				return render json: { error: "This target guild doesn't exist"}, status: :unprocessable_entity
			end
			@guild1 = current_user.guild
			if @guild1.nil?
				return render json: { error: "You don't have guild"}, status: :unprocessable_entity
			end
		end

		def check_if_wt_unanswered
			@wars = War.where(war_closed: false)
			if @wars.nil?
				return
			end
			if @wars.empty?
				return
			end
			@wars.each do |war|
				War.check_no_answer(war)
				war.save
			end
		end

		def check_if_war_end
			@wars = War.where(war_closed: false)
			if @wars.nil?
				return
			end
				@wars.each do |war|
				if war.end_date == nil
					return render json: { error: "A war has been created without updating the rules. It's because a war request has been accepted, but you did't update the dates, etc."}, status: :unprocessable_entity
				end
				if war.end_date < DateTime.now
					War.winner_is(war)
					War.update_guilds_score(war)
					War.close_war(war)
				end
			end
		end
	end
end
