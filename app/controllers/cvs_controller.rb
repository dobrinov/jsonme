class CvsController < ApplicationController
  def show
    payload = File.read Rails.root.join('me.json')

    @cv = Parser.execute payload

    respond_to do |format|
      format.html
      format.pdf { send_data PdfCv.generate(@cv), filename: "CV_#{@cv.name.gsub(' ', '')}.pdf", disposition: :inline }
    end
  end
end
