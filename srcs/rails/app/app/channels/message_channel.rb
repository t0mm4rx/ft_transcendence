class MessageChannel < ApplicationCable::Channel
  def subscribed
  # stop_all_streams #when you subscribe stop other stream, so when you change channel its clear
  #  stream_for Channel.find(params["id"]) #start the listener
  end

  def unsubscribed
  #  stop_all_streams
    # Any cleanup needed when channel is unsubscribed
  end

end
