class GameRoomChannel < ApplicationCable::Channel

  def reco_to_normal
    @connect_type = "normal"
    GameRoom.find(params[:id]).with_lock do
      game_room = GameRoom.find(params[:id]);
      last_number_player = game_room.number_player
      if last_number_player < 2
        GameRoom.find(params[:id]).increment(:number_player, 1).save
      end
      if game_room.status == "notstarted" && game_room.number_player >= 2
        GameRoomChannel.broadcast_to game_room, message: "everyone_here"
      end
    end
  end

  # Connect to channel
  def subscribed

    @connect_type = params[:connect_type]
    @player_id = params[:player_id]
    @display_name = params[:display_name]

    GameRoom.find(params[:id]).with_lock do
      if @connect_type == "normal" && GameRoom.find(params[:id]).number_player < 2
        GameRoom.find(params[:id]).increment(:number_player, 1).save
      end
    end

    @game_room = GameRoom.find(params[:id])
    stream_for @game_room

    if @game_room.number_player >= 2
      GameRoomChannel.broadcast_to @game_room, message: "everyone_here"
    end

  end

  # Disconnect from the channel
  def unsubscribed

    GameRoom.find(params[:id]).with_lock do
      if @connect_type == "normal"
        GameRoom.find(params[:id]).decrement(:number_player, 1).save
      end
    end

    game_room = GameRoom.find(params[:id])

    if (game_room.status != "notstarted" && game_room.number_player <= 0) || game_room.number_player < 0
      if (game_room.player_score < 11 && game_room.opponent_score < 11)
        if @player_id == game_room.player_id
          game_room.update_scores(User.find(game_room.opponent_id))
        elsif @player_id == game_room.opponent_id
          game_room.update_scores(User.find(game_room.player_id))
        end
      end
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
    # game_room = GameRoom.find(params[:id])
    GameRoomChannel.broadcast_to @game_room, sender: data['infos']['sender'], message: data['infos']['message'], content: data['infos']['content']
  end
  
end
