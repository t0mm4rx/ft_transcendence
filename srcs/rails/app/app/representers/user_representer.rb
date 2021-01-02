class UserRepresenter
	def initialize(user)
	  @user = user
	end

	def as_json
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

	private

	attr_reader :user
end
