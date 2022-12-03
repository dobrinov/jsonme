class Profile
  attr_reader :name, :image

  class << self
    def for(product, username)
      payload =
        if product == 'github'
          GithubFetcher.execute username
        elsif product == 'gitlab'
          GitlabFetcher.execute username
        else
          raise "Unsupported product #{product}"
        end

      raise "Cannot fetch profile for #{username}" unless payload.present?

      json = JSON.parse(payload.to_s)

      return invalid_result 'The JSON body should be a hash.' unless json.is_a? Hash

      json = json.with_indifferent_access

      new name: json[:name], image: json[:image]
    end
  end

  def initialize(name:, image:)
    @name = name
    @image = image
  end
end
