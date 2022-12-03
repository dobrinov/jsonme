module GithubFetcher
  extend self

  def execute(repository)
    Fetcher.execute "https://raw.githubusercontent.com/#{repository}/me/main/me.json"
  end

  def post(repository, name)
    Fetcher.execute "https://raw.githubusercontent.com/#{repository}/me/main/posts/#{name}.md"
  end
end
