class PendingGamesSerializer < ActiveModel::Serializer
	attributes :id, :game_type, :from

	def from
		object.player.username
	end
	
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
