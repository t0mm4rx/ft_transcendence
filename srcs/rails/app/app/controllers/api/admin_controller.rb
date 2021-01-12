module Api
	class AdminController < ApplicationController
		before_action :check_if_admin

		def create
			target = User.find_by_id(params[:user_id]) rescue nil
			if target == nil
				return render json: error = {error: "user doesn't exist"},  status: :unprocessable_entity
			elsif target != nil && target.admin == true
				return render json: error = {error: "already admin"}, status: :forbidden
			else
			  target.admin = true
			  target.save
			  render json: target, status: :created
			end
		end

		private
			def check_if_admin
					cu = User.find_by_id(current_user.id) rescue nil
					if cu == nil
						return render json: error = {error: "You don't have account"}, status: :forbidden
					elsif cu != nil && cu.admin != true
						return render json: error = {error: "You tried... but you are not admin bro"}, status: :forbidden
					end
			end
	end
end
