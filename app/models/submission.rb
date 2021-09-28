class Submission < ApplicationRecord
  WEB_METHODS = %w(github gitlab)
  PDF_METHODS = %w(file text)
  METHODS = WEB_METHODS + PDF_METHODS
end
