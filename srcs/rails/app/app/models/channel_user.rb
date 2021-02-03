class ChannelUser < ApplicationRecord
  belongs_to :channel
  belongs_to :user

  validate :no_collision, on: :update

  def banned
		future? ban_date 
	end
	def muted
    future? mute_date 
  end
  def username
    user.username
  end
  def avatar
    user.avatar_url
  end
  def channel_name
    channel.name
  end

	private 

	def future?(date)
		return false if !date
		date > DateTime.now
  end

  def no_collision
    if (admin || owner) && (banned || muted)
      errors.add(:admin, "Can't be admin or owner and banned or muted")
    end
  end
  

end
