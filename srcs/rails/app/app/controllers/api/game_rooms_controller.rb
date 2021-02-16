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
                render json: game_room.errors, status: 422
            end
        end

        def create_ladder
            opponent = current_user.find_higher_ranked_user
            if !opponent
                return render json: {error: "could not find a worthy opponent"}, status: :not_found
            end
            game_room = GameRoom.new(opponent: opponent, player: current_user, ladder: true)
            if game_room.save 
                GlobalChannel.send("game_request", opponent, current_user, game_room.id)
                render json: game_room
            else
               render json: {}, status: :unprocessable_entity
            end
        end

        # Show page, show a game by id
        def show
            game_room = GameRoom.find(params[:id])
            render json: game_room
        end

        def update
            game = GameRoom.find(params[:id])
            # game_room.update(game_room_params_update)
            unless game.player_id == current_user.id || game.opponent_id = current_user.id
                return render json: {}, status: :forbidden
            end
            game.accepted_by(current_user)
            if game.save
                other = game.player === current_user ? game.opponent : game.player
                GlobalChannel.send("game_request_reply", other, current_user, game.id) if game.accepted
                render json: game
            else
                render json: game.errors, status: :unprocessable_entity
            end
        end
        # def update
        #     game_room = GameRoom.find(params[:id])
        #     # game_room.update_attribute(:player_id, params[:player_id])
        #     # game_room.update_attribute(:opponent_id, params[:opponent_id])
        #     # game_room.update_attribute(:status, params[:status])
        #     game_room.update(game_room_params_update)
        #     if game_room.save
        #         render json: game_room
        #     else
        #         render json: {}, status: :unprocessable_entity
        #     end
        # end

        def destroy
            game = GameRoom.find(params[:id])
            unless game.player_id == current_user.id || game.opponent_id = current_user.id
                return render json: {}, status: :forbidden
            end
            if game.tournament
                game.set_no_show(current_user)
                return render json: {}
            end
            if game.destroy
                render json: {}
            elsif
                render json: @game.errors, status: :unprocessable_entity
            end
        end

        def is_disconnected
            game_room = GameRoom.where(
                "opponent_id = ? AND status = ?", params[:user_id], "active").or(GameRoom.where(
                    "player_id = ? AND status = ?", params[:user_id], "active")).or(GameRoom.where(
                        "opponent_id = ? AND status = ?", params[:user_id], "notstarted")).or(GameRoom.where(
                            "player_id = ? AND status = ?", params[:user_id], "notstarted"))
            render json: game_room.first
        end

        def tmp_last_game
            # add check if not ended
            game_room = GameRoom.last
            render json: game_room
        end

        def update_status
            game_room = GameRoom.find(params[:id])
            game_room.update_attribute(:status, params[:status])
            render json: game_room
        end

        def update_score
            game_room = GameRoom.find(params[:id])
            game_room.update_attribute(:player_score, params[:player_score])
            game_room.update_attribute(:opponent_score, params[:opponent_score])
            if game_room.game_over? && !game_room.winner_id
                game_room.update_attribute(:status, "ended")
                game_room.update_scores
                game_room.update_war_scores(current_user)
            end
            render json: game_room
        end

        def ladder_games
            @games = GameRoom.where(ladder: true).limit(20)
            render json: @games
        end

        def livestream_games
            gameroom_normal = GameRoom.where(status: "active").first;
            render json: gameroom_normal
        end

        private

        # Set GameRoom param
        def game_room_params

            # require() : mark required parameter
            # permit() : set the autorized parameter
          #  params.require(:game_room).permit(:player, :opponent, :status, :number_player)
            params.permit(:player_id, :opponent_id, :status, :number_player, :game_type)
        end
        def game_room_params_update

            # require() : mark required parameter
            # permit() : set the autorized parameter
          #  params.require(:game_room).permit(:player, :opponent, :status, :number_player)
            params.permit(:opponent_id, :status, :number_player, :accepted)
        end
    end
end
