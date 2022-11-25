class BlogPost
  class << self
    def from_file(file_name)
      new File.read(Rails.root.join(file_name))
    end
  end

  def initialize(text)
    @text = text
  end

  def front_matter
    markdown.to_html.html_safe
  end

  def content
    Kramdown::Document.new(@text, input: 'GFM').to_html.html_safe
  end
end
