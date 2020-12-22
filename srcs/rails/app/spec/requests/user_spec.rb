require 'rails_helper'

describe "Users API", type: :request do
	describe 'GET /api/users' do
		before do
			FactoryBot.create(:user, username: "fredrikalindh", login: "frlindh")
			FactoryBot.create(:user, username: "matgj", login: "magrosje")
		end

		it 'returns all users' do
			get '/api/users'

			expect(response).to have_http_status(:success)
			expect(JSON.parse(response.body).size).to eq(2)
		end

		it 'returns one specific users' do
			get '/api/users'

			expect(response).to have_http_status(:success)
			expect(JSON.parse(response.body).size).to eq(2)
		end

		it 'returns a subset of users based on limit' do
			get '/api/users', params: { limit: 1 }
			expect(response).to have_http_status(:success)
			expect(JSON.parse(response.body).size).to eq(1)
		end
	end

	describe 'POST /api/users' do
		it 'create a new user' do
			expect {
			post '/api/users', params: { user: {username: "romain", login: "rchallie"} }
			}.to change { User.count }.from(0).to(1)
			expect(response).to have_http_status(:created)
		end
	end

	describe 'DELETE /api/users' do
		let!(:user) { FactoryBot.create(:user, username: "fredrikalindh", login: "frlindh") }

		it 'delete a user' do
			expect {
				delete "/api/users/#{user.id}"
			}.to change { User.count }.from(1).to(0)

			expect(response).to have_http_status(:no_content)
		end
	end
end
