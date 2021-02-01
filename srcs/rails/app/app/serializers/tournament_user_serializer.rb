class TournamentUserSerializer < ActiveModel::Serializer
	attributes :id, :level
	belongs_to :user, serializer: FriendSerializer
end
