require "rails_helper"

RSpec.describe ChannelsController, type: :routing do
  describe "routing" do
    it "routes to #index" do
      expect(get: "/channels").to route_to("channels#index")
    end

    it "routes to #show" do
      expect(get: "/channels/1").to route_to("channels#show", id: "1")
    end


    it "routes to #create" do
      expect(post: "/channels").to route_to("channels#create")
    end

    it "routes to #update via PUT" do
      expect(put: "/channels/1").to route_to("channels#update", id: "1")
    end

    it "routes to #update via PATCH" do
      expect(patch: "/channels/1").to route_to("channels#update", id: "1")
    end

    it "routes to #destroy" do
      expect(delete: "/channels/1").to route_to("channels#destroy", id: "1")
    end
  end
end
