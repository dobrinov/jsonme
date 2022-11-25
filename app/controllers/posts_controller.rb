class PostsController < ApplicationController
  def index
  end

  def show
    @post = BlogPost.from_file 'hello-blog.md'
  end
end
