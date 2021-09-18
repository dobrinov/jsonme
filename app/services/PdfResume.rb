class PdfResume
  include Prawn::View

  PATUA = Rails.root.join('app', 'javascript', 'fonts', 'PatuaOne-Regular.ttf')
  ROBOTO = Rails.root.join('app', 'javascript', 'fonts', 'Roboto-Regular.ttf')
  ROBOTO_BOLD = Rails.root.join('app', 'javascript', 'fonts', 'Roboto-Bold.ttf')

  class << self
    def generate(cv)
      new(cv).generate
    end
  end

  def initialize(cv)
    @resume = cv
    @width = bounds.width
  end

  def generate
    name
    move_down 5

    summary
    move_down 25

    heading 'Experience'
    move_down 10
    experience
    move_down 10

    heading 'Education'
    move_down 10
    education
    move_down 10

    heading 'Location'
    location

    render
  end

  private

  def name
    font(PATUA, size: 28) do
      text @resume.name, align: :center
    end
  end

  def summary
    font(ROBOTO, size: 12) do
      text @resume.summary
    end
  end

  def heading(text)
    font(PATUA, size: 20) do
      text text, align: :center
    end
  end

  def experience
    @resume.employments.each do |employment|
      span(@width - 170, position: :right) do
        bounding_box [-170, 0], width: 150, height: 80 do
          font(PATUA, size: 15) do
            text employment.employer.name, align: :right
          end
          font(ROBOTO, size: 8) do
            fill_color 'bbbbbb'
            text employment.employer.website, align: :right
            fill_color '000000'
          end
          move_down 2
          font(ROBOTO, size: 9) do
            fill_color '666666'
            from = Date.parse("01-#{employment.period.from}").strftime('%B %Y')
            to = employment.period.to ? Date.parse("01-#{employment.period.to}").strftime('%B %Y') : 'Present'
            text "#{from} - #{to}", align: :right
            fill_color '000000'
          end
        end
        move_up 75

        font(ROBOTO, size: 12) do
          text employment.summary
        end

        move_down 15

        employment.roles.each do |role|
          font(ROBOTO_BOLD, size: 12) do
            text role.title
          end
          move_down 1
          font(ROBOTO, size: 12) do
            text role.summary
          end

          move_down 7

          font(ROBOTO, size: 10) do
            fill_color '999999'
            text 'Major achievements:'
            fill_color '000000'
          end

          move_down 2

          role.achievements.each do |achievement|
            font(ROBOTO, size: 12) do
              text "<u>#{achievement.title}</u>", inline_format: true
            end
            move_down 2
            font(ROBOTO, size: 12) do
              text achievement.summary
            end
            move_down 2
            font(ROBOTO, size: 12) do
              text "Technologies: #{achievement.technologies.join(', ')}"
            end
            move_down 10
          end
          move_down 5
        end

        move_down 20
      end
    end
  end

  def education
    @resume.trainings.each do |training|
      span(@width - 170, position: :right) do
        bounding_box [-170, 0], width: 150, height: 60 do
          font(PATUA, size: 15) do
            text training.institution.name, align: :right
          end

          font(ROBOTO, size: 8) do
            fill_color 'bbbbbb'
            text training.institution.website, align: :right
            fill_color '000000'
          end

          move_down 2
          font(ROBOTO, size: 9) do
            fill_color '666666'
            from = Date.parse("01-#{training.period.from}").strftime('%B %Y')
            to = training.period.to ? Date.parse("01-#{training.period.to}").strftime('%B %Y') : 'Present'
            text "#{from} - #{to}", align: :right
            fill_color '000000'
          end
        end
        move_up 55

        font(ROBOTO, size: 12) do
          text training.summary
        end
        move_down 60
      end
    end
  end

  def location
    font(ROBOTO, size: 14) do
      text @resume.location.to_s, align: :center
    end
  end
end
