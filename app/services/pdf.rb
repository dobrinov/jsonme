class Pdf
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

    if @resume.trainings.any?
      heading 'Education'
      move_down 10
      education
      move_down 10
    end

    if @resume.side_projects.any?
      heading 'Side projects'
      move_down 10
      side_projects
      move_down 30
    end

    if @resume.technologies.any?
      heading 'Technologies'
      font(ROBOTO, size: 12) do
        fill_color '999999'
        text 'self evaluation', align: :center
        fill_color '000000'
      end
      move_down 10
      technologies
      move_down 10
    end

    if @resume.location.present?
      heading 'Location'
      location
    end

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
    move_down cursor if cursor < 110

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
            text format_period(employment.period.from, employment.period.to), align: :right
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
            text format_period(training.period.from, training.period.to), align: :right
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

  def side_projects
    @resume.side_projects.each do |project|
      span(@width - 170, position: :right) do
        bounding_box [-170, 0], width: 150, height: 60 do
          font(PATUA, size: 15) do
            text project.name, align: :right
          end

          font(ROBOTO, size: 8) do
            fill_color 'bbbbbb'
            if project.online
              text project.website, align: :right
            else
              text 'offline', align: :right
            end
            fill_color '000000'
          end

          move_down 2
          font(ROBOTO, size: 9) do
            fill_color '666666'
            text format_period(project.period.from, project.period.to), align: :right
            fill_color '000000'
          end
        end
        move_up 55

        font(ROBOTO, size: 12) do
          text project.summary
        end

        move_down 15
      end
    end
  end

  def technologies
    columns = 3
    gutter = 10
    column_widht = (@width - (columns - 1) * gutter) / columns

    fill_color 'ffffff'
    text '---'
    fill_color '000000'

    @resume.technologies.each_slice(columns).each do |row|
      span @width do
        row.each_with_index do |technology, index|
          bounding_box [index * column_widht + gutter * index, cursor], width: column_widht, height: 62 do
            font(PATUA, size: 13) do
              text technology.name, align: :center
            end

            move_down 2

            mentoring =
              if technology.can_mentor
                'can mentor others'
              else
                'can\'t mentor others'
              end

            used_recently =
              if technology.recently_used
                'used recently'
              else
                'not used recently'
              end

            task_complexity =
              case technology.task_complexity
              when 'easy'
                'can solve easy tasks'
              when 'intermediate'
                'can solve intermediate tasks'
              when 'hard'
                'can solve difficult tasks'
              else
                '???'
              end

            knowledge_of_features =
              case technology.knowledge_of_features
              when 'low'
                'poor knowledge of features'
              when 'medium'
                'average knowledge of features'
              when 'high'
                'high knowledge of features'
              else
                '?'
              end

            knowledge_of_best_practices =
              case technology.knowledge_of_best_practices
              when 'low'
                'poor knowledge of best practices'
              when 'medium'
                'average knowledge of best practices'
              when 'high'
                'high knowledge of best practices'
              else
                '?'
              end

            font(ROBOTO, size: 8) do
              fill_color '999999'
              text used_recently, align: :center
              text mentoring, align: :center
              text task_complexity, align: :center
              text knowledge_of_features, align: :center
              text 'average knowledge of best practices', align: :center
              fill_color '000000'
            end
          end
          move_up 62
        end

        move_down 62
      end
      fill_color 'ffffff'
      text '---'
      fill_color '000000'
    end
  end

  def format_period(from, to)
    from = Date.new(from.year, from.month, 1).strftime('%B %Y')
    to = to ? Date.new(to.year, to.month, 1).strftime('%B %Y') : 'Present'

    "#{from} - #{to}"
  end

  def location
    font(ROBOTO, size: 14) do
      text @resume.location.to_s, align: :center
    end
  end
end
