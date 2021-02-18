class GuildSerializer < ActiveModel::Serializer
	attributes :id, :name, :anagram, :score, :war_invites, :isinwar, :present_war_id, :wt_game_invite, :isinwtgame, :wt_date_to_answer, :war_invite_id, :user_ids
	has_many :users, serializer: FriendSerializer
end
