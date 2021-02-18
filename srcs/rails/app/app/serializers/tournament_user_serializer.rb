class TournamentUserSerializer < ActiveModel::Serializer
	attributes :id, :eliminated, :wins
	belongs_to :user, serializer: FriendSerializer
end
