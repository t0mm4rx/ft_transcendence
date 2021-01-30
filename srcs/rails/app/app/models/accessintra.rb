class Accessintra < ApplicationRecord

	#create a new authentification token to access API based on 42 info
	#param = login from 42 and password
	def self.get_token(login, password, hostname)
		api_token = JSON.parse(HTTParty.post("http://" + hostname + ":3000/api/authenticate", body:{login:login,
		password:password,}).body)
		return api_token
	end

	#create a new user to access API based on 42 info
	#param = info = json info from 42 API
	def self.create_user (info)
		password = "password"
		if User.exists?(login:info["login"]) == false
			user = User.create(login: info["login"], password: "password", username: info["login"])
		end
		api_token = get_token(info["login"], password, info["hostname"])
		return api_token
	end
end
