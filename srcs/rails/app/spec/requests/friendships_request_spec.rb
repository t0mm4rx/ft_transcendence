require 'rails_helper'

RSpec.describe "Friendships", type: :request do

  describe "/api/users/:id/friends" do
    before do
			@user1 = FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx")
			@user2 = FactoryBot.create(:user, username: "mathis", login: "magrosje", password: "fff")
      @user3 = FactoryBot.create(:user, username: "mathisss", login: "mabois", password: "yyy")
      @friend1 = FactoryBot.create(:friendship, user: @user1, friend: @user2, accepted: true)
      @friend2 = FactoryBot.create(:friendship, user: @user1, friend: @user3)
			@token1 = get_token("frlindh", "xxx")
    end
    
    it "list friends of a user" do
      get "/api/users/#{@user1.id}/friends", as: :json, headers: { Authorization: @token1 }
      expect(response).to have_http_status(:success)
      jsonbody = response_body
      expect(jsonbody).to eq([
        {"avatar_url"=>"https://cdn.intra.42.fr/users/small_.jpg",
        "guild"=>nil,
        "id"=>@user2.id,
        "login"=>"magrosje",
        "status"=>"offline",
        "username"=>"mathis"}
        ])
    end
  end

  describe "POST /api/friends" do
    before do
			@user1 = FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx")
			@user2 = FactoryBot.create(:user, username: "mathis", login: "magrosje", password: "fff")
			@token1 = get_token("frlindh", "xxx")
    end
    
    it "Send friend request to user" do
      post "/api/friends", params:  { id: @user2.id } , headers: { Authorization: @token1 }
      expect(response).to have_http_status(:created)
      jsonbody = response_body
      id = jsonbody["id"]
      expect(jsonbody['user_id']).to eq(@user1.id)
      expect(jsonbody['friend_id']).to eq(@user2.id)
      expect(jsonbody['accepted']).to be false
    end
  end

  describe "POST /api/friends x 2" do
    before do
			@user1 = FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx")
      @user2 = FactoryBot.create(:user, username: "mathis", login: "magrosje", password: "fff")
      @user3 = FactoryBot.create(:user, username: "mathisss", login: "mabois", password: "yyy")
      @token1 = get_token("frlindh", "xxx")
      @token2 = get_token("magrosje", "fff")
      @token3 = get_token("mabois", "yyy")
      post "/api/friends", params:  { id: @user2.id } , headers: { Authorization: @token1 }
      # post "/api/friends", params:  { id: @user1.id } , headers: { Authorization: @token3 }
    end
    
    it "Send friend request to same user" do
      post "/api/friends", params:  { id: @user2.id } , headers: { Authorization: @token1 }
      expect(response).to have_http_status(:unprocessable_entity)
      
      post "/api/friends", params:  { id: @user1.id } , headers: { Authorization: @token2 }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PUT /api/friends/:id" do
    before do
			@user1 = FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx")
      @user2 = FactoryBot.create(:user, username: "mathis", login: "magrosje", password: "fff")
      @user3 = FactoryBot.create(:user, username: "mathisss", login: "mabois", password: "yyy")
      @token1 = get_token("frlindh", "xxx")
      @token2 = get_token("magrosje", "fff")
      @token3 = get_token("mabois", "yyy")
      post "/api/friends", params:  { id: @user2.id } , headers: { Authorization: @token1 }
      post "/api/friends", params:  { id: @user1.id } , headers: { Authorization: @token3 }
    end
    
    it "Accept friends request" do
      expect {
				put "/api/friends/#{@user1.id}", params:  {} , headers: { Authorization: @token2 }
			}.to change { @user1.friends.count }.from(0).to(1)
      expect(response).to have_http_status(:ok)
      expect(@user2.friends.count).to eq(1)

      expect {
        put "/api/friends/#{@user3.id}", params:  {} , headers: { Authorization: @token1 }
			}.to change { @user1.friends.count }.from(1).to(2)
      expect(response).to have_http_status(:ok)
      expect(@user3.friends.count).to eq(1)

      get "/api/users/#{@user1.id}/friends", as: :json, headers: { Authorization: @token1 }
      expect(response).to have_http_status(:success)  
      expect(response_body).to eq([{
        "avatar_url"=>"https://cdn.intra.42.fr/users/small_.jpg", 
        "guild"=>nil,
        "id"=>@user2.id, 
        "login"=>"magrosje", 
        "status"=>"offline", 
        "username"=>"mathis"
      },
      {
       "avatar_url"=>"https://cdn.intra.42.fr/users/small_.jpg",
       "guild"=>nil,
       "id"=>@user3.id,
       "login"=>"mabois",
       "status"=>"offline",
       "username"=>"mathisss"
       }])

      get "/api/users/#{@user2.id}/friends", as: :json, headers: { Authorization: @token1 }
      expect(response).to have_http_status(:success)  
      expect(response_body).to eq([{
        "avatar_url"=>"https://cdn.intra.42.fr/users/small_.jpg",
        "guild"=>nil,
        "id"=>@user1.id,
        "login"=>"frlindh",
        "status"=>"offline",
        "username"=>"fredrika"
      }])
    end
  end

  describe "DELETE /api/friends/:id" do
    before do
			@user1 = FactoryBot.create(:user, username: "fredrika", login: "frlindh", password: "xxx")
      @user2 = FactoryBot.create(:user, username: "mathis", login: "magrosje", password: "fff")
      @user3 = FactoryBot.create(:user, username: "mathisss", login: "mabois", password: "yyy")
      @friend1 = FactoryBot.create(:friendship, user: @user1, friend: @user2, accepted: true)
      @token1 = get_token("frlindh", "xxx")
      @token2 = get_token("magrosje", "fff")
      @token3 = get_token("mabois", "yyy")
      post "/api/friends", params:  { id: @user1.id } , headers: { Authorization: @token3 }
    end
    
    it "Decline friends request" do
      expect {
				delete "/api/friends/#{@user3.id}", as: :json, headers: { Authorization: @token1 }
			}.to change { @user1.pending_requests.count }.from(1).to(0)
    end
    it "Remove friend" do
      expect {
				delete "/api/friends/#{@user2.id}", as: :json, headers: { Authorization: @token1 }
			}.to change { @user1.friends.count }.from(1).to(0)
    end
  end
end
