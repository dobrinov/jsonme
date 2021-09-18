class TextSubmissionsController < SubmissionsController
  def create
    @cv = Parser.execute params[:payload]

    send_data PdfCv.generate(@cv), filename: "CV_#{@cv.name.gsub(' ', '')}.pdf", disposition: :inline
  end
end
