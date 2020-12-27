module Api
  class UsersController < ApplicationController
    LIMIT_PAGINATION_MAX = 20

    def index
      # users = User.where(online: true).limit(limit).offset(params[:offset])
      # users = User.limit(limit).offset(params[:offset])
      users = User.order(online: :desc).limit(limit).offset(params[:offset])

      render json: UsersRepresenter.new(users).as_json
    end

    def create
      user = User.new(user_params)
      if user.save
        render json: UserRepresenter.new(user).as_json, status: :created
      else
        render json: user.errors, status: :unprocessable_entity # 422
      end
    end

    def update
      user = User.find(params[:id])
      user ||= User.new(user_params)
      user.update(user_params)
      if user.save
        render json: UserRepresenter.new(user).as_json
      else
        render json: user.errors, status: :unprocessable_entity # 422
      end
    end

    def destroy
      User.find(params[:id]).destroy!
      head :no_content
    end

    def show
      user = User.find(params[:id])

      render json: UserRepresenter.new(user).as_json
    end

    private
    
    def user_params
      params.require(:user).permit(:username, :login, :avatar_url)
    end

    def limit
      [
        params.fetch(:limit, LIMIT_PAGINATION_MAX).to_i,
        LIMIT_PAGINATION_MAX
      ].min
    end
  end
end
