class User < ApplicationRecord
	has_many :relations, dependent: :destroy
	has_many :related_users, :class_name => 'Relation', :foreign_key => 'other_id'

	validates :username, presence: true, length: { minimum:2, maximum: 30}
	validates :login, presence: true, length: { minimum:2, maximum: 30 }, uniqueness: { case_sensitive: false }
	# validates :avatar_url, # format: { with: ConstantData::VALID_EMAIL_REGEX }
	
	after_initialize :set_defaults

    def set_defaults
      self.wins ||= 0
	  self.losses ||= 0
	  self.admin ||= false
	  self.online ||= false
	  self.avatar_url ||= "https://cdn.intra.42.fr/users/small_#{self.login}.jpg"
    end
end
