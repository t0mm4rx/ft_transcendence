class GameRoomChannel < ApplicationCable::Channel

  # Connect to channel
  def subscribed
    @game_room = GameRoom.find(params[:id])
    stream_for @game_room
  end

  # Disconnect from the channel
  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def to_broadcast (data)
    # game_room = GameRoom.find(params[:id])
    GameRoomChannel.broadcast_to @game_room, message: data['infos']['message'], content: data['infos']['content']
  end

  def ready(data)
    # game_room = GameRoom.find(params[:id])
    GameRoomChannel.broadcast_to @game_room, message: "everyone_ready", opponent_infos: data['infos']
  end
  
end
