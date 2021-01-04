class UserSerializer < ActiveModel::Serializer
  attributes :id, :username, :login, :avatar_url, :wins, :losses, :relation_to_user, :online
  belongs_to :guild
  has_many :friends, serializer: FriendSerializer
  has_many :friendships
  has_many :pending_friends
  has_many :pending_requests
  def relation_to_user
    @instance_options[:relation]
  end
end