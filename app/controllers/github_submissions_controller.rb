class GithubSubmissionsController < SubmissionsController
  def show
    payload = Net::HTTP.get URI.parse("https://raw.githubusercontent.com/#{decode(params[:id])}/me/main/cv.json")
    @cv = Parser.execute payload

    render 'resume'
  end

  def create
    redirect_to github_submission_path encode(params[:username])
  end
end
