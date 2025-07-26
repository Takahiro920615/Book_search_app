Rails.application.routes.draw do
  # API用のDeviseルート（JWTログイン/登録のみ）
  devise_for :users, path: 'api', controllers: {
    sessions: 'users/sessions',
    registrations: 'api/registrations',
    omniauth_callbacks: 'users/omniauth_callbacks'
  }, path_names: {
    sign_up: '',
    registration: 'sign_up'
  }
  
  devise_scope :user do
    get 'api/users/auth/:provider/callback', to: 'users/omniauth_callbacks#google_oauth2'
  end

  # テスト用ルート
  get '/test', to: 'test#index'

  # API名前空間
  namespace :api do
    post 'sign_in', to: 'sessions#create'
    post 'sign_up', to: 'registrations#create'
    delete 'sign_out', to: 'sessions#destroy'
    get 'user', to: 'users#show'
    get 'protected', to: 'users#protected'
  end
end
