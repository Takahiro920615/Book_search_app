Rails.application.routes.draw do
  # API用のDeviseルート（JWTログイン/登録のみ）
  devise_for :users, path: 'api', controllers: {
    sessions: 'users/sessions',
    registrations: 'api/registrations'
  }, path_names: {
    sign_up: '',
    registration: 'sign_up'
  }, skip: [:omniauth_callbacks, :passwords, :confirmations]

  # OmniAuth用のルート（Googleログインのみ）
  devise_scope :user do
    get '/auth/:provider', to: 'users/omniauth_callbacks#passthru', as: :user_omniauth_authorize
    get '/auth/:provider/callback', to: 'users/omniauth_callbacks#google_oauth2', as: :user_omniauth_callback
    get '/auth/failure', to: redirect('/')
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
