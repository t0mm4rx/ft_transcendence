class FriendSerializer < ActiveModel::Serializer
  attributes :id, :username, :login, :avatar_url, :status, :guild_officer, :guild_owner, :ladder_score, :admin
end
