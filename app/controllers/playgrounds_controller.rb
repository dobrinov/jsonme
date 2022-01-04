class PlaygroundsController < ApplicationController
  def index
    render layout: 'onboarding'
  end

  def resume
    render layout: 'resume'
  end

  def drilldown
    render layout: 'drilldown'
  end
end
