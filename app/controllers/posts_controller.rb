class PostsController < ApplicationController
  layout 'blog'

  def show
    @post = BlogPost.parse GithubFetcher.post(params[:username], params[:id]).to_s
  end
end
