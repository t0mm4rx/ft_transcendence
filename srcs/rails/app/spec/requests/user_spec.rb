require 'rails_helper'

# RSpec.
describe "Users API", type: :request do
	describe 'GET /users' do
		before do
			FactoryBot.create(:user, username: "fredrikalindh", login: "frlindh")
			FactoryBot.create(:user, username: "matgj", login: "magrosje")
		end

		it 'returns all users' do			
			get '/api/users'
			expect(response).to have_http_status(:success)  
			expect(response_body.size).to eq(2)
		end
	end

	describe 'POST /users/1' do
		it 'create a new user' do
			expect {
				post '/api/users', params: { user: {username: "romain", login: "rchallie"} }
			}.to change { User.count }.from(0).to(1)
			expect(response).to have_http_status(:created)
			jsonbody = response_body
			jsonbody['id'] = 1
			expect(jsonbody).to eq(
				{
					'id' => 1,
					'username' => 'romain',
					'login' => 'rchallie',
					'username' => 'romain',
					'avatar' =>  "https://cdn.intra.42.fr/users/small_rchallie.jpg",
					'guild' => nil,
					'wins' => 0,
					'losses' => 0,
					'admin' => false,
					'online' => false,
					# 'friends' => []
				}
			)
		end
	end

	describe 'DELETE /users/1' do
		let!(:user) { FactoryBot.create(:user, username: "fredrikalindh", login: "frlindh") }

		it 'delete a user' do
			expect {
				delete "/api/users/#{user.id}"
			}.to change { User.count }.from(1).to(0)

			expect(response).to have_http_status(:no_content)
		end
	end

	private

end
