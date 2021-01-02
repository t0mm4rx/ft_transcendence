Rails.application.routes.draw do
  namespace :api do
    root 'users#index'
    resources :channels do
      resources :channel_users
      resources :messages
    end
   # mount ActionCable.server => '/cable'
    resources :users do
      resources :friends, controller: 'relations'
    end
    resources :logintra, only: :index
    resources :accessintra, only: :index
    post 'authenticate', to: 'authentication#authenticate'
  end
end
