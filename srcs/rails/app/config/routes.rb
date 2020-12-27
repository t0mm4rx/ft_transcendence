Rails.application.routes.draw do
  get 'relations/index'
  namespace :api do
    root 'users#index'
    resources :users do
      resources :friends, controller: 'relations'
    end
    resources :logintra, only: :index
    resources :accessintra, only: :index
    post 'authenticate', to: 'authentication#create'
  end
end
