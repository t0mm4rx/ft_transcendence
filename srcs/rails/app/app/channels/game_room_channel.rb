class GameRoomChannel < ApplicationCable::Channel

  # Connect to channel
  def subscribed
    @game_room = GameRoom.find(params[:id])
    stream_for @game_room
    puts "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa"
    puts "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa"
    puts ""
    puts @game_room.number_player
    puts ""
    puts "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa"
    puts "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa"
    # use request param to know if it's player
    last_number_player = @game_room.number_player
    @game_room.update(number_player: last_number_player + 1)
    puts "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb"
    puts "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb"
    puts ""
    puts @game_room.number_player
    puts ""
    puts "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb"
    puts "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb"
  end

  # Disconnect from the channel
  def unsubscribed
    @game_room = GameRoom.find(params[:id])
    puts "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCc"
    puts "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCc"
    puts ""
    puts @game_room.number_player
    puts ""
    puts "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCc"
    puts "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCc"

    last_number_player = @game_room.number_player
    @game_room.update(number_player: last_number_player - 1)
    if @game_room.status != "notstarted" && @game_room.number_player == 0
      @game_room.update(status: "ended")
    else
      GameRoomChannel.broadcast_to @game_room, message:"client_quit", content: { "player_id" => @player_id, "display_name" => @display_name }.to_json
    end

    puts "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDdd"
    puts "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDdd"
    puts ""
    puts @game_room.number_player
    puts ""
    puts "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDdd"
    puts "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDdd"
  end

  def whoami(data)
    @player_id = data['infos']['player_id']
    @display_name = data['infos']['display_name']
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
