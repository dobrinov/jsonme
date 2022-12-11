class Parser
  Resume = Struct.new :name, :image, :summary, :errors, :payload do
    def invalid?
      errors.any?
    end

    def valid?
      errors.blank?
    end

    def filename
      if name.present?
        resume.name.gsub(' ', '-').downcase
      else
        'noname'
      end
    end

    def to_json
      payload
    end
  end

  Result = Struct.new :resume, :error

  class << self
    def execute(payload)
      new(payload).execute
    end
  end

  def initialize(payload)
    @payload = payload
  end

  def execute
    json = JSON.parse(@payload)

    return invalid_result 'The JSON body should be a hash.' unless json.is_a? Hash

    json = json.with_indifferent_access

    name = json[:name]
    image = json[:image]
    summary = json[:summary]

    if name.present? && summary.present?
      Resume.new name, image, summary, [], @payload
    else
      invalid_result <<~ERROR
          Your resume should have at least a name, a short summary of you and some employment history.
          Without this as minimum, it will look empty.
        ERROR
    end
  rescue JSON::ParserError
    invalid_result 'Invalid JSON'
  end

  private

  def invalid_result(error)
    Resume.new nil, nil, nil, [], [], [], [], nil, [error], @payload
  end
end
