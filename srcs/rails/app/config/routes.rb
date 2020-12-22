Rails.application.routes.draw do
  namespace :api do
    resources :users, only: [:index, :create, :show, :destroy, :update]
  end
end
