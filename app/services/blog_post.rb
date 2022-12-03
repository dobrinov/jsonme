class BlogPost
  attr_reader :title, :date, :body
  attr_accessor :author_name, :author_image

  class << self
    def for(product, username, id)
      profile = Profile.for product, username

      payload =
        if product == 'github'
          GithubFetcher.post username, id
        elsif product == 'gitlab'
          raise 'Not implemented yet'
        else
          raise "Unsupported product #{product}"
        end

      raise "Cannot fetch blog post for #{username}, #{id}" unless payload.present?

      raw = payload.to_s.split "\n"

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

      new title: title, date: date, body: body, author_name: profile.name, author_image: profile.image
    end
  end

  def initialize(title:, date:, body:, author_name: nil, author_image: nil)
    @title = title
    @date = date
    @author_name = author_name
    @author_image = author_image
    @body = body
  end
end
