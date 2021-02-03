class GameRequest < ApplicationRecord
    belongs_to :user
    belongs_to :opponent, class_name: :User

    def self.exists?(id1, id2)
        case1 = !GameRequest.where(user_id: id1, opponent_id: id2, accepted: false).empty?
        case2 = !GameRequest.where(user_id: id2, opponent_id: id1, accepted: false).empty?
        case1 || case2
    end

    validate :not_the_same_as_user
    validate :unique_combination, :on => :create

    private

    def not_the_same_as_user
        errors.add(:opponent_id, "can't be the same as user") if opponent_id === user_id
    end

    def unique_combination
        if GameRequest.exists?(opponent_id, user_id)
            errors.add(:opponent_id, "GameRequest already exists")
        end
    end
end
