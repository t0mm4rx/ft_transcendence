module Api
	class SearchController < ApplicationController
		before_action :set_prefix
		before_action :users
		before_action :guilds
		before_action :tournaments

		def search 
			return {} if @prefix.empty?
			render json: {users: @users, guilds: @guilds, tournaments: @tournaments}
		end

		def set_prefix
			@prefix = params[:input]
			if @prefix.length > 10 || @prefix.match(/\A[a-zA-Z0-9 ]*\z/).nil?
				puts "bad input!"
				@prefix = ""
			end
		end

		def users
			users = User.starts_with("login", @prefix) + User.starts_with("username", @prefix) 
			@users = users.uniq.map do |user|
				{
					id: user.id,
					name: user.login
				}
			end
		end
		def guilds
			guilds = Guild.starts_with("name", @prefix) + Guild.starts_with("anagram", @prefix) 
			@guilds = guilds.uniq.map do |guild|
				{
					id: guild.id,
					name: guild.anagram
				}
			end
		end
		def tournaments
			tournaments = Tournament.starts_with("name", @prefix)
			@tournaments = tournaments.uniq.map do |tournament|
				{
					id: tournament.id,
					name: tournament.name
				}
			end
		end
	end
end
