class GlobalChannel < ApplicationCable::Channel
  def subscribed

    puts "UUUUUUUUUUUU"
    puts params
    puts "UUUUUUUUUUUU"

    @user_id = params["user_id"]
    User.find(@user_id).update_attribute(:status, "online");
    GlobalChannel.broadcast_to "global_channel", message:"new_client", content: {}

    # stream_from "some_channel"
    stream_for "global_channel"

  end

  def unsubscribed
    User.find(@user_id).update_attribute(:status, "offline");
    GlobalChannel.broadcast_to "global_channel", message:"client_quit", content: { "quit" => "plop" }.to_json
      # Any cleanup needed when channel is unsubscribed
  end

  def to_broadcast (data)
    GlobalChannel.broadcast_to "global_channel", sender: data['infos']['sender'], message: data['infos']['message'], content: data['infos']['content']
  end
end
