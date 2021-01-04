class RelationSerializer < ActiveModel::Serializer
  attributes :user_id, :other_id

  # def status
  #   "pending" if status == 0
  #   "friends" if status == 1
  #   "blocked" if status == 2
  #   # "pending" if relation.pending?
  #   # "friends" if relation.friends?
  #   # "blocked" if relation.blocked?
  # end
end
