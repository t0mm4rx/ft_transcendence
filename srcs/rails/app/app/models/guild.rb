class Guild < ApplicationRecord
	validates :name, presence: true, length: { minimum:2, maximum: 30}, uniqueness: { case_sensitive: false }
	validates :anagram, presence: true, length: { minimum:2, maximum: 30}, uniqueness: { case_sensitive: false }
	
	has_many :users

	after_initialize :set_defaults

    def set_defaults
      self.score = 0
    end
end
