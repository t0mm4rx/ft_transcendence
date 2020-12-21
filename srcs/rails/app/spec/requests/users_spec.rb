require 'rails_helper'

describe 'Users API', type: :request do
	describe 'GET /users' do
		it 'returns all users' do
		FactoryBot.create(:user, username:'fredrikaaaaaa', login:"frlindh", avatar:"ddd", guild_id:"1", wins:"10", losses:"0", online:"false", admin:"false")
		FactoryBot.create(:user, username:"romain", login:"rchallie", avatar:"", guild_id:"1", wins:"10", losses:"0", online:"false", admin:"false")

		get '/api/v1/users'

	expect(response).to have_http_status(:success)
	expect(JSON.parse(response.body).size).to eq(3)
	end
end

		describe 'POST /users' do
			it 'create a new user' do
				post '/api/v1/users', params: {user: {username:'fredrikaaaaaa', login:'frlindh', avatar:'ddd', guild_id:'1', wins:'10', losses:'0', online:'false', admin:'false'} }

		expect(response).to have_http_status(:created)
		end
	end
end
