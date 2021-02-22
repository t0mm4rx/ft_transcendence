class MessageSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :channel_id, :username, :avatar, :body, :date, :login, :guild_anagram

  def guild_anagram
    if object.user && object.user.guild
      object.user.guild.anagram
    end
  end

end
