class GameRoomChannel < ApplicationCable::Channel

  def reco_to_normal
    game_room = GameRoom.find(params[:id])

    @connect_type = "normal"

    last_number_player = game_room.number_player
    game_room.update(number_player: last_number_player + 1)
  end

  # Connect to channel
  def subscribed

    @connect_type = params[:connect_type]
    @player_id = params[:player_id]
    @display_name = params[:display_name]

    GameRoom.find(params[:id]).with_lock do
      if @connect_type == "normal"
        GameRoom.find(params[:id]).increment(:number_player, 1).save
      end
    end
    game_room = GameRoom.find(params[:id])
    stream_for game_room
  end

  # Disconnect from the channel
  def unsubscribed

    GameRoom.find(params[:id]).with_lock do
      if @connect_type == "normal"
        GameRoom.find(params[:id]).decrement(:number_player, 1).save
      end
    end

    game_room = GameRoom.find(params[:id])

    if game_room.status != "notstarted" && game_room.number_player <= 0
      game_room.update(status: "ended")
    end

    if game_room.status != "notstarted"
      GameRoomChannel.broadcast_to game_room, message:"client_quit", content: { "player_id" => @player_id, "display_name" => @display_name, "connection_type" => @connect_type }.to_json
    end

  end

  def whoami(data)
    @player_id = data['infos']['player_id']
    @display_name = data['infos']['display_name']
  end

  def to_broadcast (data)
    game_room = GameRoom.find(params[:id])
    GameRoomChannel.broadcast_to game_room, sender: data['infos']['sender'], message: data['infos']['message'], content: data['infos']['content']
  end

  def ready(data)
    game_room = GameRoom.find(params[:id])
    GameRoomChannel.broadcast_to game_room, message: "everyone_ready", opponent_infos: data['infos']
  end
  
end
