require 'rails_helper'

RSpec.describe "Relations", type: :request do

  describe "GET /api/users/1/friends" do
    it "returns http success" do
      get "/api/users/1/friends"
      expect(response).to have_http_status(:success)
    end
  end

end
