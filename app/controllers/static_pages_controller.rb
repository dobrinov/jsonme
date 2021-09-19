class StaticPagesController < ApplicationController
  def landingpage
    render layout: 'landingpage'
  end
end
