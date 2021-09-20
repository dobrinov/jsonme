module Fetcher
  extend self

  def execute(url)
    response = HTTP.get URI.parse(url)
    response.body if response.code == 200
  rescue URI::InvalidURIError
    nil
  end
end
