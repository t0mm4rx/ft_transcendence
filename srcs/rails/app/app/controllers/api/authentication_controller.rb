module Api
	class AuthenticationController < ApplicationController
	skip_before_action :authenticate_request

	def authenticate
	  command = AuthenticateUser.call(params[:login], params[:password])
	  
	  if command.success?
		render json: { auth_token: command.result }, status: :created
	  else
		render json: { error: command.errors }, status: :unauthorized
	  end
	end
	end
end
