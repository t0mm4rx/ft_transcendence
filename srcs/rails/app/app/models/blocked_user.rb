class BlockedUser < ApplicationRecord
  belongs_to :user, optional: true
end
