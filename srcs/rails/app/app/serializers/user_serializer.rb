class UserSerializer < ActiveModel::Serializer
<<<<<<< HEAD
  attributes :id, :username, :login, :avatar_url, :wins, :losses, :relation_to_user, :online, :tfa, :otp_secret_key
=======
  attributes :id, :username, :login, :avatar_url, :wins, :losses, :relation_to_user, :online, :tfa, :admin
>>>>>>> e548e733e9c9032c9b26620a0506e7d6a351e997
  belongs_to :guild
  has_many :friends, serializer: FriendSerializer
  has_many :pending_friends
  has_many :pending_requests
  def relation_to_user
    @instance_options[:relation]
  end
end
