Rails.application.routes.draw do
  get ':method/new', to: 'submissions#new',
                     as: :new_submission,
                     constraints: { method: /#{Submission::METHODS.join('|')}/ }

  get ':method/:username', to: 'accounts#show', as: :resume
  get ':method/:username/posts', to: 'accounts#show', as: :posts
  get ':method/:username/posts/:post', to: 'accounts#show', as: :post

  post ':method', to: 'submissions#create',
                  as: :submissions,
                  constraints: { method: /#{Submission::METHODS.join('|')}/ }


  get 'example', to: 'static_pages#example', as: :example
  get 'structure', to: 'static_pages#structure', as: :structure
  get 'privacy', to: 'static_pages#privacy', as: :privacy
  get 'sitemap', to: 'sitemaps#show', defaults: { format: 'xml' }, as: :sitemap

  namespace :admin do
    get 'xyz', to: 'submissions#index'
  end

  root 'static_pages#landingpage'
end
