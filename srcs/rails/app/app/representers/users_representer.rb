class UsersRepresenter
	def initialize(users)
	  @users = users
	end

	def as_json
		users.map do |user|
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
			}
		end
	end

	private

	attr_reader :users
end
