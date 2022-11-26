class BlogPost
  attr_reader :title, :date, :body

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
        date = front_matter['date'].strftime "%d %b %Y"
      end

      # Process content
      body = Kramdown::Document.new(raw[content_start_index..].join("\n"), input: 'GFM', auto_ids: false, header_offset: 1).to_html.html_safe

      new title, date, body
    end
  end

  def initialize(title, date, body)
    @title = title
    @date = date
    @body = body
  end
end
