class Relation < ApplicationRecord
  belongs_to :user
  belongs_to :other, :class_name => 'User'

  VALID_STATES = 0..2

  def pending?
    status == 0
  end
  def friends?
    status == 1
  end


  # def self.create_reciprocal_for_ids(user_id, other_id)
  #   user_friendship = Relation.create(user_id: user_id, other_id: other_id)
  #   other_friendship = Relation.create(user_id: other_id, other_id: user_id)
  #   [user_friendship, other_friendship]
  # end
  # def self.destroy_reciprocal_for_ids(user_id, other_id)
  #   friendship1 = Relation.find_by(user_id: user_id, other_id: other_id)
  #   friendship2 = Relation.find_by(user_id: other_id, other_id: user_id)
  #   friendship1.destroy
  #   friendship2.destroy
  # end
end
