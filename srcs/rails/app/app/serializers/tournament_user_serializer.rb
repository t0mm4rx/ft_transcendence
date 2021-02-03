class TournamentUserSerializer < ActiveModel::Serializer
	attributes :id
	belongs_to :user, serializer: FriendSerializer
end
