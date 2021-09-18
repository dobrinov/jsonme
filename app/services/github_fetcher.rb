module GithubFetcher
  extend self

  def execute(repository)
    Fetcher.execute "https://raw.githubusercontent.com/#{repository}/me/main/cv.json"
  end
end
