class UserSerializer < ActiveModel::Serializer
  attributes :id, :username, :login, :avatar_url, :ladder_score, :ladder_ranking, :wins, :losses, :relation_to_user, :status, :tfa, :otp_secret_key, :admin, :owner, :blocked, :guild_id, :guild_owner, :guild_officer, :guild_invites, :guild_locked, :banned, :find_higher_ranked_user, :title

  belongs_to :guild
  has_many :friends, serializer: FriendSerializer
  has_many :pending_games, serializer: PendingGamesSerializer
  has_many :pending_friends
  has_many :pending_requests
  has_many :game_pending_requests
  
  def relation_to_user
    current_user ? current_user.relation_to(self.object) : "current_user"
  end
  def blocked
    current_user && current_user.blocked.find_by(target_id: object.id) ? true : false
  end
  def ladder_ranking
    User.order(ladder_score: :desc).index(object) + 1
  end
  def admin
		object.owner || object.admin
	end
end
