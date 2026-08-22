release: bundle exec rails db:prepare
web: bundle exec puma -C config/puma.rb
worker: bundle exec bin/jobs --mode=async
