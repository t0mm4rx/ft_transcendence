class ApplicationController < ActionController::API
	rescue_from ActiveRecord::RecordNotFound, with: :not_found
	rescue_from ActiveRecord::RecordNotDestroyed, with: :not_destroyed
	before_action :authenticate_request
	attr_reader :current_user

	def not_found(e)
		render json: {errors: e}, status: :not_found
	end
	def not_destroyed(e)
		render json: {errors: e.record.errors }, status: :unprocessable_entity
	end

	private

	def authenticate_request
		@current_user = AuthorizeApiRequest.call(request.headers).result
		render json: { error: 'Not Authorized' }, status: 401 unless @current_user
	end
end
