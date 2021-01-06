class Message < ApplicationRecord
  belongs_to :channel
  belongs_to :user

  def username
    user.username
  end
  def date
    updated_at.to_s
  end
end
