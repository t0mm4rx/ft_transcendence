class Friendship < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: :User

  def self.exists?(id1, id2)
    case1 = !Friendship.where(user_id: id1, friend_id: id2).empty?
    case2 = !Friendship.where(user_id: id2, friend_id: id1).empty?
    case1 || case2
  end

  def self.find_record(id1, id2)
    record = Friendship.find_by(user_id: id1, friend_id: id2) 
    record ||= Friendship.find_by(user_id: id2, friend_id: id1)
  end

  def self.accepted_record?(id1, id2)
    case1 = !Friendship.where(user_id: id1, friend_id: id2, accepted: true).empty?
    case2 = !Friendship.where(user_id: id2, friend_id: id1, accepted: true).empty?
    case1 || case2
  end

  def self.find_friendship(id1, id2)
    if Friendship.where(user_id: id1, friend_id: id2, accepted: true).empty?
      Friendship.where(user_id: id2, friend_id: id1, accepted: true)[0]
    else
      Friendship.where(user_id: id1, friend_id: id2, accepted: true)[0]
    end
  end

  validate :not_the_same_as_user
  validate :unique_combination

  private

  def not_the_same_as_user
    errors.add(:friend_id, "can't be the same as user") if friend_id === user_id
  end

  def unique_combination
    if Friendship.exists?(friend_id, user_id)
      errors.add(:friend_id, "combination already exists")
    end
  end

end
