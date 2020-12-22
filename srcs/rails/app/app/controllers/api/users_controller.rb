module Api
  class UsersController < ApplicationController
    def index
      users = User.all

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

    def destroy
      User.find(params[:id]).destroy!
      head :no_content
    end

    private
    
    def user_params
      params.require(:user).permit(:username, :login, :avatar_url)
    end
  end
end
