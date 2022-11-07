lock "~> 3.17.1"

set :application, "jsonme"
set :repo_url, "git@github.com:dobrinov/jsonme.git"

set :deploy_user, :app
set :branch, :main
set :deploy_to, "/var/www/jsonme.com"
set :keep_releases, 3

set :rbenv_type, :user
set :rbenv_ruby, '3.0.4'

set :linked_files, %w{config/database.yml config/master.key config/credentials.yml.enc config/puma.rb}
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "tmp/webpacker", "public/system", "vendor", "storage"

# Disable asset pipeline manifest backup
Rake::Task["deploy:assets:backup_manifest"].clear_actions
