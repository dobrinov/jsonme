Rails.application.routes.draw do
  resource :example, only: %i(show)

  root 'examples#show'
end
