module Api
  class UsersController < ApplicationController
    LIMIT_PAGINATION_MAX = 20
    skip_before_action :authenticate_request, only: :create

    def index
      # users = User.where(online: true).limit(limit).offset(params[:offset])
      # users = User.limit(limit).offset(params[:offset])
      users = User.order(online: :desc).limit(limit).offset(params[:offset])
      render json: users, each_serializer: FriendSerializer
    end

    def create
      user = User.new(user_params_init)
      if user.save
        User.set_first_admin(user)
        user.save
        render json: user, status: :created
      else
        render json: user.errors, status: :unprocessable_entity # 422
      end
    end

    def update
      user = User.find(params[:id])
      if !user
        return render json: { error: "no such user" }, status: :not_found
      end
      unless user === current_user || current_user.admin
        return render json: {}, status: :forbidden
      end
      user.update(user_params_change)
      if user.save
        render json: user
      else
        render json: user.errors, status: :unprocessable_entity # 422
      end
    end

    def destroy
      user = User.find(params[:id])
      if !user
        return render json: {}, status: :not_found
      end
      unless user === current_user || current_user.admin
        return render json: {}, status: :forbidden
      end
      if user.destroy
        render json: {}, status: :ok
      elsif
        render json: user.errors, status: :forbidden
      end
    end

    def show
      id = params[:id]
      id = current_user.id if id == "me"
      user = User.find(id)

      render json: user, relation: get_relation_to(user)
    end

    private

    def user_params_init
      #params.require(:user).permit(:username, :login, :avatar_url)
      params.permit(:username, :login, :avatar_url, :password) #without require its allow to POST straight away some users, it's faster to test our API
    end

    def user_params_change
      params.permit(:username, :avatar_url, :password, :guild_id)
    end

    def limit
      [
        params.fetch(:limit, LIMIT_PAGINATION_MAX).to_i,
        LIMIT_PAGINATION_MAX
      ].min
    end

    def get_relation_to(user)
      return "current_user" if user === current_user
      current_user.friendship_status(user)
    end
  end
end
