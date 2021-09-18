class FileSubmissionsController < SubmissionsController
  def create
    payload = params[:file].read
    @resume = Parser.execute payload

    send_data PdfResume.generate(@resume), filename: "CV_#{@resume.name.gsub(' ', '')}.pdf", disposition: :inline
  end
end
