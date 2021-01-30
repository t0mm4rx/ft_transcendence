module Api
	class LogintraController < ApplicationController
	skip_before_action :authenticate_request
		def index
			#redirect user to the api.intra.42.fr link where he can autorize us to access his public data, this link is personalized and comes from the registration of our app on 42 app
			redirect_to "https://api.intra.42.fr/oauth/authorize?client_id=8b706e0f8b73ecef4b95c137e7cf51cd1e6706991d8c856a14afd9ffd110e4fc&redirect_uri=http%3A%2F%2F"+ "#{request.host}" +"%3A3000%2Fapi%2Faccessintra&response_type=code"
		end
	end
end
