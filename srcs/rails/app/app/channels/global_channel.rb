class GlobalChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    stream_for "global_channel"

  end

  def unsubscribed
      GlobalChannel.broadcast_to "global_channel", message:"client_quit", content: { "quit" => "plop" }.to_json
      # Any cleanup needed when channel is unsubscribed
  end

  def to_broadcast (data)
    GlobalChannel.broadcast_to "global_channel", sender: data['infos']['sender'], message: data['infos']['message'], content: data['infos']['content']
  end
end
