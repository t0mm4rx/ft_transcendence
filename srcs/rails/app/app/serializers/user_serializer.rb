class UserSerializer < ActiveModel::Serializer
  attributes :id, :username, :login, :avatar_url, :wins, :losses, :relation_to_user, :online, :tfa, :otp_secret_key, :admin, :blocked, :guild_id, :guild_owner, :guild_officer, :guild_invites, :guild_locked, :banned

  belongs_to :guild
  has_many :friends, serializer: FriendSerializer
  has_many :pending_friends
  has_many :pending_requests
  has_many :game_pending_requests
  def relation_to_user
    current_user ? current_user.relation_to(self.object) : "current_user"
  end
  def blocked
    current_user && current_user.blocked.find_by(target_id: object.id) ? true : false
  end
end
