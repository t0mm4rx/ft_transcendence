module Api
	class AccessintraController < ApplicationController
	skip_before_action :authenticate_request

		def index
			#once the user authorize us to access his data via /logintra, 42 api redirect to /accessintra with the code needed to have a token in parameters
			#we need to send a post request with our code to get a token access
			token = JSON.parse(HTTParty.post("https://api.intra.42.fr/oauth/token", body:{client_id:"9ebfeb67d8038c9e760916b1ee383301776c830a9bb4fc8f5658ea06bc9cfb89",
				grant_type:"authorization_code",
				client_secret:"e0ce000d0f730499bd97e4147a1e349e1c10e4cdaa10d68b53a496e7e5f6a83d",
				code:params[:code],
				redirect_uri:"http://127.0.0.1:3000/api/accessintra",}).body)
			#get request with header access token
			render json: HTTParty.get("https://api.intra.42.fr/v2/me", headers: {Authorization: "Bearer #{token["access_token"]}"})
			#TODO : parse the get request to transfer info into User, should we do a before action in user?
		end
	end
end
