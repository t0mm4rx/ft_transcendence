require 'rails_helper'

describe "Authentication", type: :request do 
	describe "POST /authenticate" do
		let (:user) {FactoryBot.create(:user, username: "fredrikalindh", login: "frlindh", password: 'password123' )}
		
		it 'authentificate the client' do
			id = user.id
			post '/api/authenticate', params: { login: 'frlindh', password: 'password123' }
			expect(response).to have_http_status(:created)
			token = response_body['token']
		
			# decoded_token = JWT.decode(
			# 	token, 
			# 	AuthenticationTokenService::HMAC_SECRET, 
			# 	true, 
			# 	{ algorithm: AuthenticationTokenService::ALGORITHM_TYPE}
			# )
			# expect(decoded_token).to eq([
			# 	{ "user_id" => id},
			# 	{"alg" => AuthenticationTokenService::ALGORITHM_TYPE}
			# ])
		end
		# it 'returns error when username is missing' do
		# 	post '/api/authenticate', params: { password: 'password123' }
		# 	expect(response).to have_http_status(:unprocessable_entity)
		# 	expect(response_body).to eq({
		# 		'error' => "param is missing or the value is empty: username"
		# 	})
		# end
		# it 'returns error when password is missing' do
		# 	post '/api/authenticate', params: { username: 'fredrikalindh' }
		# 	expect(response).to have_http_status(:unprocessable_entity)
		# 	expect(response_body).to eq({
		# 		'error' => "param is missing or the value is empty: password"
		# 	})
		# end
	end
end

