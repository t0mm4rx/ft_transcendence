module Api
	class AccessintraController < ApplicationController
	skip_before_action :authenticate_request

		def index
			#once the user authorize us to access his data via /logintra, 42 api redirect to /accessintra with the code needed to have a token in parameters
			#we need to send a post request with our code to get a token access
			token = JSON.parse(HTTParty.post("https://api.intra.42.fr/oauth/token", body:{client_id:"8b706e0f8b73ecef4b95c137e7cf51cd1e6706991d8c856a14afd9ffd110e4fc",
				grant_type:"authorization_code",
				client_secret:"4530570c421e2f111c6d4e87c6634d63976f458ec20a4f96614e24a50dcb31c5",
				code:params[:code],
				redirect_uri:"http://"+ "#{request.host}" +":3000/api/accessintra",}).body)

			#get request with header access token
			info = HTTParty.get("https://api.intra.42.fr/v2/me", headers: {Authorization: "Bearer #{token["access_token"]}"})

			if user = User.find_by_login(info["login"])
				creation = false
			end

			# save hostname
			info["hostname"] = "#{request.host}";
			
			#method to create a new user and token based on 42 infos
			api_token = Accessintra.create_user(info)
			if creation == false
				redirect_to "http://"+ "#{request.host}" +":8080/#token/?token=#{api_token["auth_token"]}&creation=false"
			else
				redirect_to "http://"+ "#{request.host}" +":8080/#token/?token=#{api_token["auth_token"]}&creation=true"
			end
		end
	end
end
