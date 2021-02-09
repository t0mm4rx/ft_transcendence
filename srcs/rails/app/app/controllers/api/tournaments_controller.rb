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
		params.permit(:name, :registration_start, :start_date, :title)
		# params.require(:name, :registration_start, :start_date, :end_date).permit(:name, :registration_start, :start_date, :end_date)
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
