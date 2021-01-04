module Api
  class RelationsController < ApplicationController
    LIMIT_PAGINATION_MAX = 20

    def index
      all_friends = Relation.where(status: 1, user_id: params[:user_id])
      .or(Relation.where(status: 1, other_id: params[:user_id]))
      .limit(limit).offset(params[:offset])
      user_id = params[:user_id].to_i
      friends = all_friends.map { |rel| rel.user_id === user_id ? rel.other : rel.user}

      render json: friends
    end

    def create
      # todo check so user_id == logged in user
      user_id = params[:user_id].to_i
      other_id = params[:other_id].to_i

      existing = Relation.where(user_id: user_id, other_id: other_id)
      .or(Relation.where(user_id: other_id, other_id: user_id))
      p existing[0]
      if existing.empty? 
        friendship = Relation.new({user_id: user_id, other_id: other_id, status: 0})
      else
        friendship = existing.first
        unless friendship.blocked?
          friendship.update(status: 1)
        end
      end

      if friendship.save
        render json: {}
      else
        render json: friendship.errors, status: :unprocessable_entity # 422
      end
      # if it doesn't exist -> status = 'request sent'
      # if it exists with 'pending' or 'request recv' -> status = 'friends
    end

    private

    def limit
      [
        params.fetch(:limit, LIMIT_PAGINATION_MAX).to_i,
        LIMIT_PAGINATION_MAX
      ].min
      end

    def user_params
      params.require(:user).permit(:username, :login, :avatar_url)
    end

  end
end
