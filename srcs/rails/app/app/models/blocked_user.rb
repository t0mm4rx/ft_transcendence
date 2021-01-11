class BlockedUser < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :target, class_name: :User

	def self.blocked_list(current_user)
		targets = current_user.blocked.map do |block|
			block.target_id
		end
		return targets
	end
end
