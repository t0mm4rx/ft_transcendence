module Api
    class GameRequestsController < ApplicationController

        def index
            game_request = GameRequest.all
            render json: game_request
        end

        def create

            request = GameRequest.new(user_id: params[:userid], opponent_id: params[:opponentid], accepted: false)

            if request.save
              render json: request, status: :created
            else
              render json: request.errors, status: :unprocessable_entity # 422
            end
        end

        def update
          gamerequest = GameRequest.find_by(user_id: params[:userid], opponent_id: params[:opponentid], accepted: false)
          if !gamerequest
            return render json: { error: "no existing request from user"}, status: :not_found
          end
          gamerequest.update(accepted: true)
          if gamerequest.save
            render json: gamerequest
          else
            render json: gamerequest.errors, status: :unprocessable_entity # 422
          end
        end

        def destroy
          game_request = GameRequest.find(params[:id])
          if game_request.opponent != current_user
            return render json: {}, status: :forbidden
          end
          if game_request.destroy
            render json: {}
          else
            render json: game_request.errors, status: :unprocessable_entity
          end
        end

        def first_no_oppenent
          gamerequest = GameRequest.where(opponent_id: -1).first
          render json: gamerequest
        end

        def change_opponent
          gamerequest = GameRequest.where(id: params[:id], user_id: params[:userid], opponent_id: -1, accepted: false).first
          gamerequest.update(opponent_id: params[:opponentid])
          if gamerequest.save
            render json: gamerequest
          else
            render json: gamerequest.errors, status: :unprocessable_entity # 422
          end
        end

        def destroy_empty_requests
          gamerequests = GameRequest.where(user_id: params[:userid], opponent_id: -1, accepted: false);
          GameRequest.destroy(gamerequests.map(&:id))
        end
    end
end
