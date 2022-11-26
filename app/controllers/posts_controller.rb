class PostsController < ApplicationController
  layout 'blog'

  def index
  end

  def show
    @post = BlogPost.from_file 'hello-blog.md'
  end
end
