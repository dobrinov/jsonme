class FileSubmissionsController < SubmissionsController
  def create
    payload = params[:file].read
    @cv = Parser.execute payload

    send_data PdfCv.generate(@cv), filename: "CV_#{@cv.name.gsub(' ', '')}.pdf", disposition: :inline
  end
end
