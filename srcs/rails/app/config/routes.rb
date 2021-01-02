Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  resources :game_rooms, only: [:index, :create, :show, :update]

  get '/game/match_no_opponent', to: 'game_rooms#first_no_oppenent'
  # get '/game/end_match/:id', to: 'game_rooms#end_game'

  mount ActionCable.server => '/cable'
end
