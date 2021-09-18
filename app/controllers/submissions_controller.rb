class SubmissionsController < ApplicationController
  helper_method :submission_methods
  def show
    @method = params[:method]
    @resume = Parser.execute payload_for(@method)
  end

  def new
    @method = params[:method]
  end

  def create
    @method = params[:method]

    if @method.in? WEB_SUBMISSION_METHODS
      redirect_to submission_path method: @method, username: encode(params[:username])
    else
      resume = Parser.execute payload_for(@method)
      send_data Pdf.generate(resume), filename: "CV_#{resume.name.gsub(' ', '')}.pdf", disposition: :inline
    end
  end

  private

  def payload_for(method)
    payload =
      case method
      when 'text'
        params[:payload]
      when 'file'
        params[:file].read
      when 'gitlab'
        GitlabFetcher.execute decode(params[:username])
      when 'github'
        GithubFetcher.execute decode(params[:username])
      else
        raise 'Unsupported submission method'
      end

    raise 'Cannot fetch resume' unless payload

    payload
  end

  def encode(text)
    text.gsub '.', '-'
  end

  def decode(text)
    text.gsub '-', '.'
  end

  def submission_methods
    SUBMISSION_METHODS
  end
end
