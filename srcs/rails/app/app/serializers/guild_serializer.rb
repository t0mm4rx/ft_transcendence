class GuildSerializer < ActiveModel::Serializer
  attributes :name, :anagram, :score
end
