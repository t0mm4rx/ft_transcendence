class GameRoomSerializer < ActiveModel::Serializer
	attributes :id, :updated_at, :game_type, :player_score, :opponent_score, :ladder

	belongs_to :player, serializer: FriendSerializer
	belongs_to :opponent, serializer: FriendSerializer
	has_one :winner, serializer: FriendSerializer
	belongs_to :tournament
end
