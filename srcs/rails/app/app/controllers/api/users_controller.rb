module Api
  class UsersController < ApplicationController
    LIMIT_PAGINATION_MAX = 20
    skip_before_action :authenticate_request, only: :create
    before_action :set_user, except: [:create, :index]
    before_action :validate_rights, only: [:destroy, :update]

    def index
      if params.has_key?(:admin) && params[:admin] 
        users = User.where(admin: true)
      else
        users = User.order(ladder_score: :desc).limit(limit).offset(params[:offset])
      end
      render json: users, each_serializer: FriendSerializer
    end

    def create
      @user = User.new(user_params_init)
      if @user.save
        render json: @user, status: :created
      else
        render json: @user.errors, status: :unprocessable_entity # 422
      end
    end

    def update
      if params.has_key?(:banned_until)
        params[:banned_until] = Time.now + params[:banned_until].to_i * 60
      end
      if !@user
        return render json: { error: "no such user" }, status: :not_found
      end
      unless @user === current_user || params.has_key?(:admin)
        if (!current_user.admin || @user.owner) && !current_user.owner
          return render json: {error: "not sufficient rights"}, status: :forbidden
        end
      end
      @user.update(user_params_change)
      if @user.save
        render json: @user
      else
        render json: @user.errors, status: :unprocessable_entity # 422
      end
    end

    def destroy
      if !@user
        return render json: {}, status: :not_found
      end
      unless @user === current_user || current_user.admin
        return render json: {}, status: :forbidden
      end
      if @user.destroy
        render json: {}, status: :ok
      elsif
        render json: @user.errors, status: :forbidden
      end
    end

    def show
      # @user.update_attribute(:title, "SMASHER")
      # @user.update(admin: true);
      # @user.save();
      render json: @user
    end

    def games
      games = @user.games.filter { |game| game.status == "ended" }
      render json: games.reverse.take(15)
    end

    private

    def set_user
      id = params[:id]
      return if id.match(/\A[a-z0-9]*\z/).nil?
      id = current_user.id if id == "me"
      @user = User.find(id) rescue nil
      if !@user
        @user = User.find_by(login: id)
      end
    end

    def validate_rights
      if !@user
        return render json: {}, status: :not_found
      end
      unless @user === current_user || current_user.admin
        return render json: {}, status: :forbidden
      end
      if params.has_key?(:banned_until) && !current_user.admin
        return render json: {}, status: :forbidden
      end
    end

    def user_params_init
      #params.require(:user).permit(:username, :login, :avatar_url)
      params.permit(:username, :login, :avatar_url, :password) #without require its allow to POST straight away some users, it's faster to test our API
    end

    def user_params_change
        params.permit(:username, :avatar_url, :password, :guild_id, :banned_until, :status, :guild_owner, :guild_officer, :admin)
    end

    def limit
      [
        params.fetch(:limit, LIMIT_PAGINATION_MAX).to_i,
        LIMIT_PAGINATION_MAX
      ].min
    end

  end
end
