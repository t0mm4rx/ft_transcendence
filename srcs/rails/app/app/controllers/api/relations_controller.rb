# require 'limit_helper'

module Api
  class RelationsController < ApplicationController
    LIMIT_PAGINATION_MAX = 20

    def index
      # finding all friend relations connected to given user_id
      friend_relations = Relation.where(status: 1, user_id: params[:user_id])
      .or(Relation.where(status: 1, other_id: params[:user_id]))
      .limit(limit).offset(params[:offset])

      # extract the user information from the non given user_id
      friends = friend_relations.filter_map do |r| 
        params[:user_id] == r.user_id ? r.other : r.user
      end

      #return an array of friends
      render json: UsersRepresenter.new(friends).as_json
    end

    def create
      friendship = Relation.new(relation_params)
      friendship.status = 0
      # friendship.save

      current_user_id = 2
      # find a relationship with the token and the user_id given
      other_user_id = params[:user_id];
      user.relations
      # if it doesn't exist -> status = 'request sent'
      # if it exists with 'pending' or 'request recv' -> status = 'friends
    end

    private

    # include limit_helper
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
