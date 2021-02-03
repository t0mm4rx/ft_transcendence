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
            render json: gamerequest, status: :created
          else
            render json: gamerequest.errors, status: :unprocessable_entity # 422
          end
        end

        def destroy
        end
    end
end