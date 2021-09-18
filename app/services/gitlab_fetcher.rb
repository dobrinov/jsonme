module GitlabFetcher
  extend self

  def execute(repository)
    Fetcher.execute "https://gitlab.com/#{repository}/me/-/raw/main/cv.json"
  end
end
