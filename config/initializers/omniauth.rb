# config/initializers/omniauth.rb
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :github, APP_CONFIG[:github_id], APP_CONFIG[:github_secret]
end
