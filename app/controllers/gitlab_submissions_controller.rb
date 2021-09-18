class GitlabSubmissionsController < SubmissionsController
  def show
    def show
      payload = Net::HTTP.get URI.parse("https://gitlab.com/#{decode(params[:id])}/me/-/raw/main/cv.json")
      @cv = Parser.execute payload

      render 'cvs/show'
    end
  end

  def create
    redirect_to gitlab_submission_path encode(params[:username])
  end
end
