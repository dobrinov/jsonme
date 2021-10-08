class StaticPagesController < ApplicationController
  def landingpage
    render layout: 'landingpage'
  end

  def schema
    render layout: 'application'
  end

  def privacy
    render layout: 'application'
  end
end
