class BlogPost
  attr_reader :title, :date, :author_name, :author_image, :body

  class << self
    def from_file(file_name)
      raw = File.read(Rails.root.join(file_name)).split "\n"

      title = nil
      date = nil
      body = nil

      content_start_index = 0

      # Check for front matter
      if raw[content_start_index] == '---'
        start_index = content_start_index + 1
        end_index = raw[1..-1].index('---')
        content_start_index = end_index + 2

        front_matter = YAML.load raw[start_index, end_index].join("\n")
        title = front_matter['title']
        date = front_matter['date'].strftime "%B %d, %Y"
      end

      # Process content
      body =
        Kramdown::Document.
          new(raw[content_start_index..].
          join("\n"), input: 'GFM', auto_ids: false, header_offset: 1).
          to_html.
          html_safe

      author_name = 'Deyan Dobrinov'
      author_image = 'https://avatars.githubusercontent.com/u/996877?v=4'

      new title, date, author_name, author_image, body
    end
  end

  def initialize(title, date, author_name, author_image, body)
    @title = title
    @date = date
    @author_name = author_name
    @author_image = author_image
    @body = body
  end
end
