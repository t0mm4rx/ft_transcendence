class FriendSerializer < ActiveModel::Serializer
  attributes :id, :username, :login, :avatar_url, :online, :guild_officer, :guild_owner
end
