class GameRoomSerializer < ActiveModel::Serializer
	attributes :id, :updated_at, :player, :opponent, :game_type, :winner_id
end
