module Api

  class FriendshipsController < ApplicationController
    LIMIT_PAGINATION_MAX = 20

    def index
      user = User.find(params[:user_id])
      render json: user.friends, each_serializer: FriendSerializer
    end

    def create
      request = Friendship.new(user: current_user, friend_id: params[:id])
      if request.save
        render json: request, status: :created
      else
        render json: request.errors, status: :unprocessable_entity # 422
      end
    end

    def update
      friendship = Friendship.find_by(user_id: params[:id], friend_id: current_user.id)
      if !friendship
        return render json: { error: "no existing request from user"}, status: :not_found
      end
      friendship.update(accepted: true)
      if friendship.save
        render json: friendship, status: :created
      else
        render json: friendship.errors, status: :unprocessable_entity # 422
      end
    end

    def destroy
      friendship = Friendship.find_record(current_user.id, params[:id])
      if !friendship
        return render json: {}, status: :not_found 
      end
      unless friendship.user === current_user || friendship.friend === current_user
        return render json: {}, status: :forbidden
      end
      if friendship.destroy
        render json: {}, status: :ok
      elsif
        render json: friendship.errors, status: :unprocessable_entity
      end
    end

  private

    def friendship_params
      #params.require(:user).permit(:username, :login, :avatar_url)
      params.permit(:user_id) #without require its allow to POST straight away some users, it's faster to test our API
    end

    def limit
      [
        params.fetch(:limit, LIMIT_PAGINATION_MAX).to_i,
        LIMIT_PAGINATION_MAX
      ].min
    end
  end
end
