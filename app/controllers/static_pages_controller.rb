class StaticPagesController < ApplicationController
  def landingpage
    render layout: 'landingpage'
  end

  def example
    @resume = Parser.execute(File.read('/Users/dobrinov/dev/me/resume.json'))#Parser.execute GithubFetcher.execute('dobrinov').to_s
    render layout: 'application'
  end

  def schema
    render layout: 'application'
  end

  def privacy
    render layout: 'application'
  end
end
