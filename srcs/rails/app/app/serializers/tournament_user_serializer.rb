class TournamentUserSerializer < ActiveModel::Serializer
	attributes :id, :eliminated
	belongs_to :user, serializer: FriendSerializer
end
