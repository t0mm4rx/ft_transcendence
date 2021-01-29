class GameRoom < ApplicationRecord
	# belongs_to :player, class_name: 'User', :foreign_key => 'player'
	# belongs_to :opponent, class_name: 'User', :foreign_key => 'opponent'
	# belongs_to :gameable, polymorphic: true

	def self.update_war_scores(game_room, current_user)
		if current_user.guild.present_war_id != 0
			war = War.find(current_user.guild.present_war_id)
			guild1 = Guild.find_by(id: war.guild1_id)
			guild2 = Guild.find_by(id: war.guild2_id)
			if war.add_count_all == true || game_room.game_type == 'war' || game_room.game_type == 'war_time'
				winner = User.find(game_room.winner_id)
				guild1.isinwtgame = false
				guild2.isinwtgame = false
				if winner.guild_id == war.guild1_id
					war.guild1_score =+ 1
				else
					war.guild2_score =+ 1
				end
				war.save
				game_room.save
			end
		end
	end
end
