class UsersController < ApplicationController
  def index
    render json: User.all
  end

  def create
   user = User.new(user_params) #username: params[:title], login: params[:login], avatar: params[:avatar], guild_id: params[:guild_id], wins: params[:wins], losses: params[:losses], online: params[:online], params[:admin])
   if user.save
    render json: user, status: :created
   else
    render json: user.errors, status: :unproccessable_entity
   end
  end

  private
  def user_params
    params.require(:user).permit(:title, :login, :avatar, :guild_id, :wins, :losses, :online, :admin)
  end
end
