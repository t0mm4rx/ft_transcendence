class Guild < ApplicationRecord
	validates :name, presence: true, length: { minimum:2, maximum: 30}, uniqueness: { case_sensitive: false }, format: {with: /\A[^`@;\$%\^*+]+\z/}
	validates :anagram, presence: true, length: { minimum:2, maximum: 5}, uniqueness: { case_sensitive: false }, format: {with: /\A[a-zA-Z0-9]+\z/}

	has_many :users, class_name: :User, dependent: :nullify

	has_many :guild1_wars, class_name: :War, :foreign_key => 'guild1_id', dependent: :destroy
	has_many :guild2_wars, class_name: :War, :foreign_key => 'guild2_id', dependent: :destroy

	after_initialize :set_defaults

	def self.check_rights(current_user)
		if current_user.guild_owner == true || current_user.guild_officer == true
			return true
		end
	end

	def set_defaults
		self.isinwar ||= false
		self.war_invites ||= 0
		self.wt_game_invite ||= 0
		self.war_invite_id ||= 0
		self.isinwtgame ||= false
	end
end
