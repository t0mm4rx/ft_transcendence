module Api
	class BlockedUsersController < ApplicationController
		def index
			@blocked_list = BlockedUser.where("user_id = ?", current_user.id).and(BlockedUser.where.not(target_id: nil))
			render json: @blocked_list
		end

		def create
			@target = BlockedUser.find_by(user_id: current_user.id, target_id: params[:target_id])
			if @target.nil?
				@blocked_user = BlockedUser.new(user_id: current_user.id, target_id: params[:target_id])
				if @blocked_user.save!
					render json: @blocked_user, status: :created
				else
					render json: @blocked_user.errors, status: :unprocessable_entity
				end
			else
				render json: error = {error: "already blocked"}.to_json, status: :forbidden
			end
		end

	    def destroy
			@blocked_user = BlockedUser.find_by(target_id: params[:id])
			if @blocked_user.destroy
			  render json: {}, status: :ok
			elsif
			  render json: blocked_user.errors, status: :unprocessable_entity
			end
		end
	end
end
