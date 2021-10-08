class SitemapsController < ApplicationController
  def show
    static = [
      [schema_url, '2021-10-01'],
      [privacy_url, '2021-10-08'],
      [submission_url(method: 'github', username: 'dobrinov'), '2021-10-08']
    ]

    submission = Submission::METHODS.map { |method| [new_submission_url(method: method), '2021-10-01'] }

    @urls = static + submission
  end
end
