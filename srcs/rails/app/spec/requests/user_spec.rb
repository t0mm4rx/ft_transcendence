require 'rails_helper'

# RSpec.
describe "Users API", type: :request do
	describe 'GET /users' do
		before do
			FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx")
			FactoryBot.create(:user, username: "mathis", login: "magrosje", password: "xxx")
			@token = get_token("frlindh", "xxx")
		end

		it 'returns all users' do	
			get '/api/users', as: :json, headers: { Authorization: @token }
			expect(response).to have_http_status(:success)  
			expect(response_body.size).to eq(2)
		end
	end

	describe 'GET /users/:id' do
		before do
			@user = FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx")
			@token = get_token("frlindh", "xxx")
		end

		it 'Get specific user' do	
			get "/api/users/#{@user.id}", as: :json, headers: { Authorization: @token }
			expect(response).to have_http_status(:success)  
			expect(response_body).to eq({
			"avatar_url" => "https://cdn.intra.42.fr/users/small_.jpg",
			"friends" => [],
			"friendships" => [],
			"guild" => nil,
			"id" => @user.id,
			"login" => "frlindh",
			"losses" => 0,
			"status" => "offline",
			"pending_friends" => [],
			"pending_requests" => [],
			"relation_to_user" => "current_user",
			"username" => "fredrika",
			"wins" => 0
			})
		end
	end

	describe 'POST /users/1' do
		it 'create a new user' do
			expect {
				post '/api/users', params: { username: "fredrika", login: "frlindh", password: "xxx" }
			}.to change { User.count }.from(0).to(1)
			expect(response).to have_http_status(:created)
			jsonbody = response_body
			expect(jsonbody['username']).to eq('fredrika')
			expect(jsonbody['login']).to eq('frlindh')
			expect(jsonbody['avatar_url']).to eq('https://cdn.intra.42.fr/users/small_frlindh.jpg')
		end
	end

	describe 'PUT /users' do
		before do
			@user = FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx")
			@token = get_token("frlindh", "xxx")
		end

		it 'change user info' do	
			put "/api/users/#{@user.id}", 
			params: { username: 'freddiiiiie', password: 'yyy', avatar_url: 'https://cdn.intra.42.fr/users/small_magrosje.jpg' }, 
			headers: { Authorization: @token }
			expect(response).to have_http_status(:success)  
			jsonbody = response_body
			expect(jsonbody['username']).to eq('freddiiiiie')
			expect(jsonbody['login']).to eq('frlindh')
			expect(jsonbody['avatar_url']).to eq('https://cdn.intra.42.fr/users/small_magrosje.jpg')
			post '/api/authenticate', params: { login: 'frlindh', password: 'yyy' }
			expect(response).to have_http_status(:created)
		end
	end

	# describe 'DELETE /users/1' do
	# 	let!(:user) { FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx") }

	# 	it 'delete a user' do
	# 		post '/api/authenticate', params: { login: 'frlindh', password: 'xxx' }
	# 		expect(response).to have_http_status(:created)
	# 		token = "Bearer " + response_body['auth_token']

	# 		expect {
	# 			delete "/api/users/#{user.id}", as: :json, headers: { Authorization: @token }
	# 		}.to change { User.count }.from(1).to(0)

	# 		expect(response).to have_http_status(:no_content)
	# 	end
	# end

end
