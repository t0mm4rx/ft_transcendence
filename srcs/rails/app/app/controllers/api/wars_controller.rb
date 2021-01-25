module Api
	class WarsController < ApplicationController
		 before_action :set_guilds, only: [:create, :show, :update, :destroy]
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

		def war_params
			params.permit(:guild1_id, :guild2_id, :start, :end, :wt_start, :wt_end, :wt_max_unanswers, :add_count_all, :guild1_score, :guild2_score, :prize)
		end

		def set_guilds
			@guild1 = Guild.find_by(id: params[:guild1_id])
			@guild2 = Guild.find_by(id: params[:guild2_id])
		end
	end
end
