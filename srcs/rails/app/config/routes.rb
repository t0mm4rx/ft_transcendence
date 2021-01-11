Rails.application.routes.draw do
  put '/api/channels/:channel_id/channel_users/', to: 'api/channel_users#update'
  namespace :api do
    root 'users#index'
    resources :channels do
      resources :channel_users
      resources :messages
    end
    resources :users do
      resources :friends, controller: 'friendships', only: :index
    end
    resources :blocked, controller: 'blocked_users'#, only: [:index, :create, :destroy]
    resources :friends, controller: 'friendships', only: [:create, :update, :destroy]
    resources :logintra, only: :index
    resources :accessintra, only: :index
    post 'authenticate', to: 'authentication#authenticate'
  end

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  resources :game_rooms, only: [:index, :create, :show, :update]

  get '/game/match_no_opponent', to: 'game_rooms#first_no_oppenent'
  # get '/game/end_match/:id', to: 'game_rooms#end_game'

  mount ActionCable.server => '/cable'

end
