class Guild < ApplicationRecord
	validates :name, presence: true, length: { minimum:2, maximum: 30}, uniqueness: { case_sensitive: false }
	validates :anagram, presence: true, length: { minimum:2, maximum: 5}, uniqueness: { case_sensitive: false }

	has_many :users, class_name: :User, dependent: :nullify

	has_many :guild1_wars, class_name: :War, :foreign_key => 'guild1_id', dependent: :destroy
	has_many :guild2_wars, class_name: :War, :foreign_key => 'guild2_id', dependent: :destroy

	# has_many :g1_wars, :class_name => 'War', :foreign_key => 'guild1_id', dependent: :destroy
	# has_many :g2_wars, :class_name => 'War', :foreign_key => 'guild2_id', dependent: :destroy

	after_initialize :set_defaults

	def self.check_rights(current_user)
		if current_user.guild_owner == true || current_user.guild_officer == true
			return true
		end
	end

	def set_defaults
		self.score ||= 0
	end
end
