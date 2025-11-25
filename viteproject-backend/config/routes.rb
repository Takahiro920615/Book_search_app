Rails.application.routes.draw do
  # API用のDeviseルート（JWTログイン/登録のみ）
  devise_for :users, path: 'api', controllers: {
    sessions: 'users/sessions',
    registrations: 'api/registrations',
    omniauth_callbacks: 'users/omniauth_callbacks'
  }, path_names: {
    sign_in: 'sign_in',
    sign_out: 'sign_out',
    sign_up: '',
    registration: 'sign_up'
  }
  # テスト用ルート
  get '/test', to: 'test#index'

  # API名前空間
  namespace :api do
    namespace :v1 do
      resources :favorites, only: [:index, :create, :destroy], param: :book_id
    end
    # post 'sign_in', to: 'sessions#create'
    # post 'sign_up', to: 'registrations#create'
    get 'user', to: 'users#show'
    get 'protected', to: 'users#protected'
  end
end
