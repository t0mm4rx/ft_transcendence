Rails.application.routes.draw do
  namespace :api do
    root 'users#index'
    resources :channels do
      resources :channel_users
      resources :messages
    end
    resources :users do
      resources :friends, controller: 'friendships', only: :index
    end

    resources :friends, controller: 'friendships', only: [:create, :update, :destroy]

    resources :tfa, only: [:index, :create]
    resources :admin, only: [:create]
    resources :blocked, controller: 'blocked_users'#, only: [:index, :create, :destroy]
    resources :guilds, only: [:index, :create, :show, :update, :destroy]
      post '/guilds/send_request', to: 'guilds#send_request'
      post '/guilds/ignore_invitation', to: 'guilds#ignore_invitation'
      post '/guilds/accept_invitation', to: 'guilds#accept_invitation'
      post '/guilds/delete_member', to: 'guilds#delete_member'

    resources :tournaments
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
    get '/game/match_no_opponent', to: 'game_rooms#first_no_oppenent'
    post '/game/is_disconnected', to: 'game_rooms#is_diconnected'
    get '/game/tmp_last_game', to: 'game_rooms#tmp_last_game'
    post '/game/:id/update_score', to: 'game_rooms#update_score'
end

  mount ActionCable.server => '/cable'

end
