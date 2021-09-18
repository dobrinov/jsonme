class TextSubmissionsController < SubmissionsController
  def create
    @resume = Parser.execute params[:payload]

    send_data PdfResume.generate(@resume), filename: "CV_#{@resume.name.gsub(' ', '')}.pdf", disposition: :inline
  end
end
