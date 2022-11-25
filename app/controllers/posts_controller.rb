class PostsController < ApplicationController
  def index
  end

  def show
    # markdown = RDiscount.new File.read(Rails.root.join('hello-blog.md'))
    @post = BlogPost.from_file('hello-blog.md').content
  end
end
