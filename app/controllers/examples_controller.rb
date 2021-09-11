class ExamplesController < ApplicationController
  def show
    content = File.read Rails.root.join('me.json')
    json = JSON.parse(content).with_indifferent_access

    @image = json[:image]
    @name = json[:name]
    @description = json[:description]
    @location = "#{json[:location][:city]}, #{json[:location][:country]}"
    @employments = json[:employments]
    @education = json[:education]
    @experience_since_year = @education.last[:period][:from].split('-').last
    @education_since_year = @employments.last[:period][:from].split('-').last
  end
end
