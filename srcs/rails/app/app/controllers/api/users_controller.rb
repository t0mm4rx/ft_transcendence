module Api
  class UsersController < ApplicationController
   MAX_PAGINATION_LIMIT = 100
    def index
      users = User.limit(limit).offset(params[:offset])

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

    def show
      user = User.find(params[:id])
      render json: UserRepresenter.new(user).as_json
    end

    def update
      user = User.find(params[:id])
      user.update_attribute(:avatar_url, params[:user][:avatar_url])
      render json: UserRepresenter.new(user).as_json
    end

    def destroy
      User.find(params[:id]).destroy!
      head :no_content
    end

    private

    def limit
      [
        params.fetch(:limit, MAX_PAGINATION_LIMIT).to_i,
      MAX_PAGINATION_LIMIT]
      .min
    end

    def user_params
      params.require(:user).permit(:username, :login, :avatar_url)
    end
  end
end
