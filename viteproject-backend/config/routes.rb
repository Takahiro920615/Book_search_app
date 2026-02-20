Rails.application.routes.draw do
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

  get '/test', to: 'test#index'

  # namespace :api, defaults: { format: :json } do
  #   namespace :v1 do
  #     resources :favorites, only: [:index, :create, :destroy], param: :book_id
  #   end

    # v1の外でも使えるように互換ルート（フロントが /api/user で動くように）
    get 'user', to: 'users#show'
    get 'protected', to: 'users#protected'
  end

  root to: proc { [200, {}, [{status: "API is running"}.to_json]] }
end