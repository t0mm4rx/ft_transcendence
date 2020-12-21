class UsersController < ApplicationController
  def index
    render json: User.all
  end

  def create
   user = User.new(username:"matgj", login:"magrosje", avatar:"", guild_id:"1", wins:"10", losses:"0", online:"false", admin:"false")

   if user.save
    render json: user, status: :created
    else
    render json: user.errors, status: :unprocessable_entity
    end
  end
end
