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

    resources :logintra, only: :index
    resources :accessintra, only: :index
    post 'authenticate', to: 'authentication#authenticate'

    # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
    resources :game_rooms, only: [:index, :create, :show, :update]
    get '/game/match_no_opponent', to: 'game_rooms#first_no_oppenent'
    post '/game/is_disconnected', to: 'game_rooms#is_diconnected'
    get '/game/tmp_last_game', to: 'game_rooms#tmp_last_game'
end

  mount ActionCable.server => '/cable'

end
