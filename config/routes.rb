SUBMISSION_METHODS = %i(github gitlab file text)

Rails.application.routes.draw do
  get ':method/new', to: 'submissions#new',
                     as: :new_submission,
                     constraints: { method: /#{SUBMISSION_METHODS.join('|')}/ }

  SUBMISSION_METHODS.each do |method|
    get "#{method}/:id", to: "#{method}_submissions#show", as: "#{method}_submission"
    post "#{method}", to: "#{method}_submissions#create", as: "#{method}_submissions"
  end

  resources :cvs, only: %i(show)

  root 'static_pages#landingpage'
end
