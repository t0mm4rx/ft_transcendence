class UserRepresenter
	def initialize(user)
	  @user = user
	end

	def as_json
		relations = user.relations
		friends = relations.filter_map { |r| r.other if r.friends?}
		relations = Relation.where(other: user.id)
		friends += relations.filter_map { |r| r.user if r.friends?}
		{
			id: user.id,
			username: user.username,
			login: user.login,
			avatar: user.avatar_url,
			guild: user.guild,
			wins: user.wins,
			losses: user.losses,
			admin: user.admin,
			online: user.online,
			friends: friends
		}
	end

	private

	attr_reader :user
end
