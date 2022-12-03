class PostsController < ApplicationController
  layout 'blog'

  def show
    @post = BlogPost.for params[:method], params[:username].gsub('-', '.'), params[:id]
  end
end
