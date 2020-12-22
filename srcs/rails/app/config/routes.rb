Rails.application.routes.draw do
  namespace :api do 
    resources :users, only: [:index, :create, :destroy]
  end
end
