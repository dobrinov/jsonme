class SubmissionCreator
  class << self
    def execute(method, payload, username)
      new(method, payload, username).execute
    end
  end

  def initialize(method, payload, username)
    @method = method
    @payload = payload
    @username = username
  end

  def execute
    resume = Parser.execute @payload

    if resume.valid?
      if @method.in? Submission::WEB_METHODS
        Submission.where(method: @method, username: @username).first_or_create! name: resume.name
      else
        Submission.where(method: @method).first_or_create! name: resume.name
      end
    end

    resume
  end
end
