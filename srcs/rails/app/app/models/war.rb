class War < ApplicationRecord
	belongs_to :guild1, class_name: 'Guild'
	belongs_to :guild2, class_name: 'Guild'

	after_initialize :set_defaults

	def check_if_war_time_end
		if self.wt_end_date > DateTime.now
			return false
		else
			return true
		end
	end

	def check_if_war_time_start
		if self.wt_start_date > DateTime.now
			return false
		else
			return true
		end
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
