module Api
	class AuthenticationController < ApplicationController
	rescue_from ActionController::ParameterMissing, with: :parameter_missing

	  def create
		p params.require(:password).inspect

		user = User.find_by(username: params.require(:username))
		token = AuthenticationTokenService.call(user.id)
		
		render json: { token: token }, status: :created
	  end
	  def parameter_missing(e)
		render json: { error: e.message }, status: :unprocessable_entity #422
	  end
	end
  end
  