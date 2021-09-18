class ApplicationController < ActionController::Base
  helper_method :default_submission_method_path

  private

  def default_submission_method_path
    new_submission_path method: SUBMISSION_METHODS.first
  end
end
