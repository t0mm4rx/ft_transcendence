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
    end
end