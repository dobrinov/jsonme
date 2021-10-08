Rails.application.routes.draw do
  get ':method/new', to: 'submissions#new',
                     as: :new_submission,
                     constraints: { method: /#{Submission::METHODS.join('|')}/ }

  get ':method/:username', to: 'submissions#show',
                           as: :submission,
                           constraints: { method: /#{Submission::WEB_METHODS.join('|')}/ }

  post ':method', to: 'submissions#create',
                  as: :submissions,
                  constraints: { method: /#{Submission::METHODS.join('|')}/ }

  get 'schema', to: 'static_pages#schema', as: :schema
  get 'privacy', to: 'static_pages#privacy', as: :privacy

  namespace :admin do
    get 'xyz', to: 'submissions#index'
  end

  root 'static_pages#landingpage'
end
