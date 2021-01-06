module RequestHelper
	def response_body
		JSON.parse(response.body)
	end

	def get_token(login, password)
		post '/api/authenticate', params: { login: login, password: password }
		"Bearer " + response_body['auth_token']
	end
end
