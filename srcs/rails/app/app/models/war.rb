class War < ApplicationRecord
	belongs_to :guild1, class_name: 'Guild'
	belongs_to :guild2, class_name: 'Guild'

	def set_defaults
		self.add_cout_all ||= false
		self.guild1_score ||= 0
		self.guild2_score ||= 0
	end
end
