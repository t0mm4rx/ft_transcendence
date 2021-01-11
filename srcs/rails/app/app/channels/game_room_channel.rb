class GameRoomChannel < ApplicationCable::Channel

  def reco_to_normal
    @game_room = GameRoom.find(params[:id])

    @connect_type = "normal"

    last_number_player = @game_room.number_player
    @game_room.update(number_player: last_number_player + 1)
  end

  # Connect to channel
  def subscribed
    @connect_type = params[:connect_type]
    @game_room = GameRoom.find(params[:id])

    stream_for @game_room

    # use request param to know if it's player
    if @connect_type == "normal"
      last_number_player = @game_room.number_player
      @game_room.update(number_player: last_number_player + 1)
    end

  end

  # Disconnect from the channel
  def unsubscribed

    @game_room = GameRoom.find(params[:id])
    
    puts "AAAAAAAAAAAAAAAAAAAAAAA"
    puts "AAAAAAAAAAAAAAAAAAAAAAA"
    puts ""
    puts @connect_type
    puts @game_room.status
    puts ""
    puts "AAAAAAAAAAAAAAAAAAAAAAA"
    puts "AAAAAAAAAAAAAAAAAAAAAAA"

    if @connect_type == "normal"

      last_number_player = @game_room.number_player
      @game_room.update(number_player: last_number_player - 1)

      if @game_room.status != "notstarted" && @game_room.number_player <= 0
        @game_room.update(status: "ended")
      end

    end

    puts "BBBBBBBBBBBBBBBBBBBBBBBBBBB"
    puts "BBBBBBBBBBBBBBBBBBBBBBBBBBB"
    puts ""
    puts @connect_type
    puts @game_room.status
    puts ""
    puts "BBBBBBBBBBBBBBBBBBBBBBBBBBB"
    puts "BBBBBBBBBBBBBBBBBBBBBBBBBBB"

    if @game_room.status != "notstarted"
      GameRoomChannel.broadcast_to @game_room, message:"client_quit", content: { "player_id" => @player_id, "display_name" => @display_name, "connection_type" => @connect_type }.to_json
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

  def ready(data)
    # game_room = GameRoom.find(params[:id])
    GameRoomChannel.broadcast_to @game_room, message: "everyone_ready", opponent_infos: data['infos']
  end
  
end
