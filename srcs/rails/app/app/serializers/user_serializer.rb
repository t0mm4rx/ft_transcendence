class UserSerializer < ActiveModel::Serializer
  attributes :id, :username, :login, :avatar_url, :wins, :losses, :online, :guild
  belongs_to :guild
end
