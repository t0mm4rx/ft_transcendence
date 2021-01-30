module Api
    class GameRoomsController < ApplicationController
      # before_action :check_wt_game
        # Index page, show all GameRooms
        def index

            # Get all GameRoom from db
            game_rooms = GameRoom.all
            render json: game_rooms

        end

        # Create page, create a GameRoom
        def create
            game_room = GameRoom.new(game_room_params)
            if game_room.save
                render json: game_room
            else
                render json: {errors: game.errors.full_messages}, status: 422
            end
        end

        # Show page, show a game by id
        def show
            game_room = GameRoom.find(params[:id])
            render json: game_room
        end

        def update
            game_room = GameRoom.find(params[:id])
            game_room.update_attribute(:player, params[:player])
            game_room.update_attribute(:opponent, params[:opponent])
            game_room.update_attribute(:status, params[:status])
        end

        def first_no_oppenent
            game_room = GameRoom.where("opponent" => "").first
            render json: game_room
        end

        def is_diconnected
            game_room = GameRoom.where(
                "opponent = ? AND status = ?", params[:player], "active").or(GameRoom.where(
                    "player = ? AND status = ?", params[:player], "active")).or(GameRoom.where(
                        "opponent = ? AND status = ?", params[:player], "notstarted")).or(GameRoom.where(
                            "player = ? AND status = ?", params[:player], "notstarted"))
            render json: game_room.first
        end

        def tmp_last_game
            # add check if not ended
            game_room = GameRoom.last
            render json: game_room
        end

        def update_score
            game_room = GameRoom.find(params[:id])
            game_room.update_attribute(:player_score, params[:player_score])
            game_room.update_attribute(:opponent_score, params[:opponent_score])
            if game_room.player_score > game_room.opponent_score
                game_room.winner_id = game_room.player
                game_room.winner_score = game_room.player_score
            else
                game_room.winner_id = game_room.opponent
                game_room.winner_score = game_room.opponent_score
            game_room.update_attribute(:winner_id, game_room.winner_id)
            GameRoom.update_war_scores(game_room, current_user)
            render json: game_room
            end
        end

        private

        # Set GameRoom param
        def game_room_params

            # require() : mark required parameter
            # permit() : set the autorized parameter
          #  params.require(:game_room).permit(:player, :opponent, :status, :number_player)
            params.permit(:player, :opponent, :status, :number_player, :game_type)
        end

        # def check_wt_game
        #     if war_time
        # end
    end
end
