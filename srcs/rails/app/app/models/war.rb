class War < ApplicationRecord
	belongs_to :guild1, class_name: 'Guild'
	belongs_to :guild2, class_name: 'Guild'

	# def self.isinwar(guild)
	# 	if .end_date > DateTime.now
	# 		return true
	# 	else
	# 		return false
	# 	end
	# end

	def set_defaults
		self.add_cout_all ||= false
		self.guild1_score ||= 0
		self.guild2_score ||= 0
	end
end
