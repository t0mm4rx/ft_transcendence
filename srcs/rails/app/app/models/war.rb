class War < ApplicationRecord
	belongs_to :guild1, class_name: 'Guild'
	belongs_to :guild2, class_name: 'Guild'

	after_initialize :set_defaults

	def self.check_if_war_time(war)
		unless war.nil? && if war.wt_start > DateTime.now || war.wt_end < DateTime.now
			return false
		else
			return true
		end
		end
	end

	def self.winner_is(war)
		if war.guild1_score > war.guild2_score
			war.guild_win = war.guild1_id
		elsif war.guild1_score < war.guild2_score
			war.guild_win = war.guild2_id
		else
			war.guild_win = nil #equal score
		end
		war.save
	end

	def self.update_guilds_score(war)
		guild1 = Guild.find_by(id: war.guild1_id)
		guild2 = Guild.find_by(id: war.guild2_id)
		if war.guild_win && war.guild_win == guild1.id
			guild1.score += war.prize
			guild2.score -= war.prize
		elsif war.guild_win
			guild2.score += war.prize
			guild1.score -= war.prize
		end
		guild1.save
		guild2.save
	end

	def self.check_no_answer(war)
		if war.guild1.wt_date_to_answer && war.guild1.wt_date_to_answer < DateTime.now
			war.guild1_unanswers += 1
			war.guild2_score += 1
			war.guild1.wt_date_to_answer = war.end_date + 1
			war.guild1.wt_game_invite = 0
			check_max_unanswered(war)
		elsif war.guild1.wt_date_to_answer && war.guild2.wt_date_to_answer < DateTime.now
			war.guild2_unanswers += 1
			war.guild1_score += 1
			war.guild2.wt_date_to_answer = war.end_date + 1
			war.guild2.wt_game_invite = 0
			check_max_unanswered(war)
		end
		war.save
		war.guild1.save
		war.guild2.save
	end

	def self.check_max_unanswered(war)
		if war.guild1_unanswers >= war.wt_max_unanswers
			war.guild_win = war.guild2_id
			update_guilds_score(war)
			close_war(war)
		elsif war.guild2_unanswers >= war.wt_max_unanswers
			war.guild_win = war.guild1_id
			update_guilds_score(war)
			close_war(war)
		end
		war.save
	end

	def self.close_war(war)
		war.guild1.isinwar = false
		war.guild2.isinwar = false
		war.guild1.present_war_id = 0
		war.guild2.present_war_id = 0
		war.guild2.wt_game_invite = 0
		war.guild1.wt_game_invite = 0
		war.guild1.isinwtgame = false
		war.guild2.isinwtgame = false
		war.war_closed = true
		war.save
		war.guild1.save
		war.guild2.save
	end

	def set_defaults

		self.add_count_all ||= false
		self.guild1_score ||= 0
		self.guild2_score ||= 0
		self.guild1_unanswers ||= 0
		self.guild2_unanswers ||= 0
		self.war_closed ||= false
		self.accepted ||= false
		self.wt_time_to_answer ||= 1
	end
end
