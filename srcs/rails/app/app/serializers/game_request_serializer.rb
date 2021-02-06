class GameRequestSerializer < ActiveModel::Serializer
  attributes :id, :accepted, :user_id, :opponent_id

  belongs_to :user, serializer: FriendSerializer
  belongs_to :opponent, serializer: FriendSerializer
end
