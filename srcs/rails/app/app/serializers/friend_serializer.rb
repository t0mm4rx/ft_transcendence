class FriendSerializer < ActiveModel::Serializer
  attributes :id, :username, :login, :avatar_url, :online
  belongs_to :guild
end
