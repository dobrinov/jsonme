source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.0.4'

gem 'rails', '6.1.4.1'
gem 'pg'
gem 'config'
gem 'http'
gem 'prawn'
gem 'puma'
gem 'webpacker'
gem 'kramdown'
gem 'kramdown-parser-gfm'
gem 'sentry-ruby'
gem 'sentry-rails'
gem 'slim-rails'
gem 'bootsnap', require: false

group :development do
  gem 'ed25519'
  gem 'bcrypt_pbkdf'
  gem 'capistrano', require: false
  gem 'capistrano-rails'
  gem 'capistrano-rbenv'
  gem 'capistrano-bundler'
  gem 'capistrano3-puma', github: "seuros/capistrano-puma"
  gem 'listen', '~> 3.3'
  gem 'spring'
end

group :test do
  gem 'rspec-rails'
end
