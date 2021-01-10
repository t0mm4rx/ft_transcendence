class BlockedUser < ApplicationRecord
  belongs_to :user, optional: true
  # has_one :target, class_name: :User
  belongs_to :target, class_name: :User

  def self.cu_blocked_list(current_user)
  block_user = BlockedUser.where("user_id = ?", current_user.id).and(BlockedUser.where.not(target_id: nil))
 # block_user.each { |x| puts "heeeere #{x['target_id']}"}
  end
end
