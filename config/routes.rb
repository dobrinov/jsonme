WEB_SUBMISSION_METHODS = %w(github gitlab)
SUBMISSION_METHODS = WEB_SUBMISSION_METHODS + %w(file text)

Rails.application.routes.draw do
  get ':method/new', to: 'submissions#new',
                     as: :new_submission,
                     constraints: { method: /#{SUBMISSION_METHODS.join('|')}/ }

  get ':method/:username', to: 'submissions#show',
                           as: :submission,
                           constraints: { method: /#{WEB_SUBMISSION_METHODS.join('|')}/ }

  post ':method', to: 'submissions#create',
                  as: :submissions,
                  constraints: { method: /#{SUBMISSION_METHODS.join('|')}/ }

  root 'static_pages#landingpage'
end
