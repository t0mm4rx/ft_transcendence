class FriendSerializer < ActiveModel::Serializer
  attributes :id, :username, :login, :avatar_url, :status, :guild_officer, :guild_owner, :ladder_score, :admin, :owner

  def admin
		object.owner || object.admin
	end
end
