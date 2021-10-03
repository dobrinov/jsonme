class SubmissionsController < ApplicationController
  def show
    @method = params[:method]
    # payload, payload_errors = payload_for @method
    payload = File.read '/Users/dobrinov/dev/me/resume.json'
    @resume = Parser.execute payload

    respond_to do |format|
      format.html
      format.pdf do
        if @method.in? Submission::WEB_METHODS
          send_data Pdf.generate(@resume), filename: "CV_#{@resume.name.gsub(' ', '')}.pdf", disposition: :inline
        end
      end
    end
  end

  def new
    @submission_methods = Submission::METHODS
    @method = params[:method]
  end

  def create
    @submission_methods = Submission::METHODS
    @method = params[:method]
    payload, payload_errors = payload_for @method

    if payload_errors.any?
      @errors = payload_errors
      render :new and return
    end

    resume = SubmissionCreator.execute @method, payload, params[:username]

    if resume.invalid?
      @errors = resume.errors
      render :new and return
    end

    if @method.in? Submission::WEB_METHODS
      redirect_to submission_path method: @method, username: encode(params[:username])
    else
      send_data Pdf.generate(resume), filename: "CV_#{resume.name.gsub(' ', '')}.pdf", disposition: :inline
    end
  end

  private

  def payload_for(method)
    payload = nil
    errors = []

    case method
    when 'text'
      errors << 'There isn\'t anything to parse' unless params[:payload].present?
      payload = params[:payload] unless errors.any?

    when 'file'
      errors << 'File must be present' unless params[:file].present?
      errors << 'Corrupted file upload' if params[:file].present? && !params[:file].respond_to?(:read)
      payload = params[:file].read unless errors.any?

    when 'gitlab'
      response = GitlabFetcher.execute decode(params[:username]) if params[:username].present?
      errors << 'Gitlab username must be present' unless params[:username].present?
      if params[:username].present? && response.blank?
        errors << "Can not find a <strong>\"resume.json\"</strong> in <strong>\"me\"</strong> repository of <strong>#{params[:username]}</strong> Gitlab profile".html_safe
      end
      payload = response.to_s unless errors.any?

    when 'github'
      response = GithubFetcher.execute decode(params[:username]) if params[:username].present?
      errors << 'Github username must be present' unless params[:username].present?
      if params[:username].present? && response.blank?
        errors << "Can not find a <strong>\"resume.json\"</strong> in <strong>\"me\"</strong> repository of <strong>#{params[:username]}</strong> Github profile".html_safe
      end
      payload = response.to_s unless errors.any?

    else
      raise 'Unsupported submission method'
    end

    [payload, errors]
  end

  def encode(text)
    text.gsub '.', '-'
  end

  def decode(text)
    text.gsub '-', '.'
  end
end
