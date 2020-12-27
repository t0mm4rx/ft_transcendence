module Api
	class LogintraController < ApplicationController
		def index
			#redirect user to the api.intra.42.fr link where he can autorize us to access his public data, this link is personalized and comes from the registration of our app on 42 app
			redirect_to "https://api.intra.42.fr/oauth/authorize?client_id=9ebfeb67d8038c9e760916b1ee383301776c830a9bb4fc8f5658ea06bc9cfb89&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fapi%2Faccessintra&response_type=code"
		end
	end
end
