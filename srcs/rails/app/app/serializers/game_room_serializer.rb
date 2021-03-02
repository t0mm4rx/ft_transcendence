class GameRoomSerializer < ActiveModel::Serializer
	attributes :id, :updated_at, :game_type, :player_score, :opponent_score, :ladder, :status, :winner_id, :accepted,:number_player

	belongs_to :player, serializer: FriendSerializer
	belongs_to :opponent, serializer: FriendSerializer
	belongs_to :tournament

	def game_type
		if object.game_type
			object.game_type
		elsif object.ladder
			"ladder" 
		elsif object.tournament
			"tournament"
		else
			"direct"
		end
	end
end
