guild = Guild.create(name: "international killer team", anagram: "ikt")

users = User.create([ 
	# {username: "fredrika", login: "frlindh", password: "xxx", guild_id: 1},
	{username: "helene", login: "hherin", password: "xxx", guild_id: 1},
	{username: "lucas", login: "llefranc", password: "helene"}
	])
	
friendship = Friendship.create([
	{user_id: 1, friend_id: 2, accepted: true},
	{user_id: 3, friend_id: 1},
	])
friendship = Friendship.create([
	{user: users[0], friend: users[1], accepted: true},
	{user: users[2], friend: users[0]},
	])

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
	{ channel_id: 1, user_id: 1, body: "<33"},
	{ channel_id: 1, user_id: 1, body: "Wesh mon gaz!!"},
])
