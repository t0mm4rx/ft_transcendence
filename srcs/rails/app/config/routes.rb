Rails.application.routes.draw do
  get 'game_requests/index'
  namespace :api do
    get 'game_request/index'
  end
  get 'game_request/index'
  namespace :api do
    root 'users#index'
    resources :channels do
      resources :channel_users
      resources :messages
    end
    resources :users do
      resources :friends, controller: 'friendships', only: :index
    end
    get '/users/:id/games', to: 'users#games'

    resources :friends, controller: 'friendships', only: [:create, :update, :destroy]

    resources :tfa, only: [:index, :create]
    resources :admin, only: [:create]
    resources :blocked, controller: 'blocked_users'#, only: [:index, :create, :destroy]
    resources :guilds, only: [:index, :create, :show, :update, :destroy]
      post '/guilds/send_request', to: 'guilds#send_request'
      post '/guilds/ignore_invitation', to: 'guilds#ignore_invitation'
      post '/guilds/accept_invitation', to: 'guilds#accept_invitation'
      post '/guilds/delete_member', to: 'guilds#delete_member'

    resources :tournaments, only: [:index, :create, :update, :destroy]
    get 'ladder_games', to: 'game_rooms#ladder_games'
    get 'tournaments/:id/games', to: 'tournaments#games'
    get 'tournaments/:id/users', to: 'tournaments#users'
    post '/tournaments/:id/register', to: 'tournaments#register'
    delete '/tournaments/:id/unregister', to: 'tournaments#unregister'

    resources :wars, only: [:index, :update, :create]
      post '/wars/send_request', to: 'wars#send_request'
      post '/wars/ignore_invitation', to: 'wars#ignore_invitation'
      post '/wars/accept_invitation', to: 'wars#accept_invitation'
      post '/wars/:id/wt_game_invite', to: 'wars#wt_game_invite'
      post '/wars/:id/wt_game_accept', to: 'wars#wt_game_accept'

    resources :logintra, only: :index
    resources :accessintra, only: :index
    post 'authenticate', to: 'authentication#authenticate'

    # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
    resources :game_rooms, only: [:index, :create, :show, :update]
    post '/game/is_disconnected', to: 'game_rooms#is_disconnected'
    get '/game/tmp_last_game', to: 'game_rooms#tmp_last_game'
    post '/game/:id/update_score', to: 'game_rooms#update_score'
    post '/game/:id/update_status', to: 'game_rooms#update_status'

    resources :game_requests, only: [:index, :create, :update]
    get '/game/match_no_opponent', to: 'game_requests#first_no_oppenent'
    post '/game/:id/change_opponent', to: 'game_requests#change_opponent'
end

  mount ActionCable.server => '/cable'

end
