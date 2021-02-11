class ApplicationController < ActionController::API
	rescue_from ActiveRecord::RecordNotFound, with: :not_found
	rescue_from ActiveRecord::RecordNotDestroyed, with: :not_destroyed
	rescue_from ActiveRecord::RecordNotUnique, with: :not_unique

	before_action :authenticate_request
	attr_reader :current_user

	def not_found(e)
		render json: {errors: e}, status: :not_found
	end
	
	def not_destroyed(e)
		render json: {errors: e.record.errors }, status: :unprocessable_entity
	end

	def not_unique(e)
		render json: {errors: "key already exists" }, status: :unprocessable_entity
	end

	private

	def authenticate_request
		@current_user = AuthorizeApiRequest.call(request.headers).result
		if @current_user && @current_user.banned
			return render json: { error: "You are banned from the website until #{@current_user.banned_until}"}, status: :forbidden
		end
		if @current_user 
			@current_user.update_attribute(:online, true)
		else
			render json: { error: 'Not Authorized' }, status: 401 
		end
	end
end
