class Api::TournamentsController < ApplicationController
	before_action :set_tournament, except: [:create, :index]
	before_action :validate_user, only: [:create, :update, :destroy] 
	before_action :check_registration_time, only: [:register, :unregister]

	def index
		@tournaments = Tournament.all
		render json: @tournaments
	end

	def users
		@users = TournamentUser.where(tournament_id: params[:id])
		render json: @users
	end

	def games
		@games = GameRoom.where(tournament_id: params[:id])
		render json: @games
	end
	
	def create
		@tournament = Tournament.new(tournament_params)
		if @tournament.save
		  render json: @tournament
		else
		  render json: @tournament.errors, status: :unprocessable_entity
		end
	end
	
	def update
		@tournament.update(tournament_params)
		if @tournament.save
		  render json: @tournament
		else
		  render json: {}, status: :unprocessable_entity
		end
	end

	def show
		render json: @tournament.games
	end
	
	def destroy
		if @tournament.destroy
			render json: "Tournament deleted"
		else
			render json: {}, status: :unprocessable_entity
		end
	end

	def register
		@reg_user = TournamentUser.new(tournament: @tournament, user: current_user)
		if @reg_user.save
		  render json: @reg_user
		else
		  render json: @reg_user.errors, status: :unprocessable_entity
		end
	end

	def unregister
		@reg_user = TournamentUser.find_by(tournament: @tournament, user: current_user)
		unless @reg_user
			return render json: { error: "Not registered" }, status: :not_found
		end
		if @reg_user.destroy
			render json: {}
		else
			render json: @reg_user.errors, status: :unprocessable_entity
		end
	end
	
	private

	def tournament_params
		if set_time_zone
			params.permit(:name, :registration_start, :start_date, :title)
		end
	end
	def set_time_zone
		return false if !params.has_key?(:registration_start) || !params.has_key?(:start_date)
		timezone = params[:timeZone].to_i
		tz_string = "+"
		if timezone < 0 
			tz_string = "-" 
			timezone = -timezone
		end
		tz_string += "0" if timezone < 10 
		params[:registration_start] = "#{params[:registration_start]} UTC#{tz_string}#{timezone}00"
		params[:start_date] = "#{params[:start_date]} UTC#{tz_string}#{timezone}00"
		return true
	end

	def set_tournament
		@tournament = Tournament.find(params[:id])
	end

	def validate_user
		unless current_user.admin
			render json: {error: "Only admins can create, edit or delete tournaments"}, status: :unauthorized
		end
	end

	def check_registration_time
		if Time.now < @tournament.registration_start
			render json: {error: "Registration has not opened yet"}, status: :forbidden
		elsif Time.now > @tournament.start_date
			render json: {error: "You cannot edit registrations after the tournament has begun"}, status: :forbidden
		end
	end
end
