class GameRoomSerializer < ActiveModel::Serializer
	attributes :id, :updated_at, :game_type, :player_score, :opponent_score, :ladder, :status, :winner_id

	belongs_to :player, serializer: FriendSerializer
	belongs_to :opponent, serializer: FriendSerializer
	belongs_to :tournament

	def winner_id
		if object.opponent && object.player
			object.player_score < object.opponent_score ? object.opponent.id : object.player.id
		end
	end
end
