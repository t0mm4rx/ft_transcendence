guild = Guild.create(name: "international killer team", anagram: "ikt")

users = User.create([ 
	{username: "fredrika", login: "frlindh", password: "xxx", guild_id: 1},
	{username: "mathis", login: "magrosje", password: "xxx"},
	{username: "lucas", login: "llefranc", password: "helene"}
	])
	
relation = Relation.create({user: users[0], other: users[1], status: 1})

channels = Channel.create([
	{ name: "general"},
	{ name: "random"}
])

channel_users = ChannelUser.create([
	{ channel_id: 1, user_id: 1},
	{ channel_id: 1, user_id: 2},
])

messages = Message.create([
	{ channel_id: 1, user_id: 1, body: "You're the best!!"},
	{ channel_id: 1, user_id: 1, body: "<33"}
])
