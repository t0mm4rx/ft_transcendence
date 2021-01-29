class War < ApplicationRecord
	belongs_to :guild1, class_name: 'Guild'
	belongs_to :guild2, class_name: 'Guild'
#	has_many :gamerooms, as: :gameable

	after_initialize :set_defaults

	# def check_if_war_time_end
	# 	if self.wt_end_date > DateTime.now
	# 		return false
	# 	else
	# 		return true
	# 	end
	# end

	# def check_if_war_time_start
	# 	if self.wt_start_date > DateTime.now
	# 		return false
	# 	else
	# 		return true
	# 	end
	# end

	def self.winner_is(war)
		if war.guild1_score > war.guild2_score
			war.guild_win = war.guild1_id
		else
			war.guild_win = war.guild2_id
		end
		war.save
	end

	def self.update_guilds_score(war)
		guild1 = Guild.find_by(id: war.guild1_id)
		guild2 = Guild.find_by(id: war.guild2_id)
		if war.guild_win == guild1.id
			guild1.score =+ war.prize
			guild2.score =- war.prize
		else
			guild2.score =+ war.prize
			guild1.score =- war.prize
		end
		guild1.save
		guild2.save
	end

	# def check_max_unanswered
	# end

	# def save_score
	# end

	def set_defaults
		self.add_count_all ||= false
		self.guild1_score ||= 0
		self.guild2_score ||= 0
		self.guild1_unanswers ||= 0
		self.guild2_unanswers ||= 0
		self.war_closed ||= false
	end
end
