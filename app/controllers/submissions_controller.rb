class SubmissionsController < ApplicationController
  helper_method :submission_methods

  def new
    @method = params[:method]
  end

  private

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
