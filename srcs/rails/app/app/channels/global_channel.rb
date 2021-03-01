class GlobalChannel < ApplicationCable::Channel
  def subscribed

    @user_id = params["user_id"]
    user = User.find(@user_id)
    if user.status === "offline"
      user.update_attribute(:status, "online");
    end
    GlobalChannel.broadcast_to "global_channel", message:"new_client", content: {}

    # stream_from "some_channel"
    stream_for "global_channel"

  end

  def unsubscribed
    @user_id = params["user_id"]
    user = User.find(@user_id)
    user.update_attribute(:status, "offline");
    GlobalChannel.broadcast_to "global_channel", message:"client_quit", content: { "quit" => "plop" }.to_json
      # Any cleanup needed when channel is unsubscribed
  end

  def to_broadcast (data)
    GlobalChannel.broadcast_to "global_channel", sender: data['infos']['sender'], message: data['infos']['message'], content: data['infos']['content']
  end

  def self.send(message, to, from, game_id) 
    content = {}
		content['request_to'] = to.id
		content['from'] = {}
		content['from']['id'] = from.id
    content['from']['login'] = from.login
    content['gameid'] = game_id
    GlobalChannel.broadcast_to "global_channel", sender: from.id, message: message, content: content
  end
end
