class PdfCv
  include Prawn::View

  PATUA = Rails.root.join('app', 'javascript', 'fonts', 'PatuaOne-Regular.ttf')
  ROBOTO = Rails.root.join('app', 'javascript', 'fonts', 'Roboto-Regular.ttf')
  ROBOTO_BOLD = Rails.root.join('app', 'javascript', 'fonts', 'Roboto-Bold.ttf')

  class << self
    def generate(payload)
      new(payload).generate
    end
  end

  def initialize(payload)
    @payload = payload
    @width = bounds.width
  end

  def generate
    name
    move_down 5

    description
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
      text @payload[:name], align: :center
    end
  end

  def description
    font(ROBOTO, size: 12) do
      text @payload[:description]
    end
  end

  def heading(text)
    font(PATUA, size: 20) do
      text text, align: :center
    end
  end

  def experience
    @payload[:employments].each do |employment|
      span(@width - 170, position: :right) do
        bounding_box [-170, 0], width: 150, height: 80 do
          font(PATUA, size: 15) do
            text employment[:company][:name], align: :right
          end
          font(ROBOTO, size: 8) do
            fill_color 'bbbbbb'
            text employment[:company][:website], align: :right
            fill_color '000000'
          end
          move_down 2
          font(ROBOTO, size: 9) do
            fill_color '666666'
            from = Date.parse("01-#{employment[:period][:from]}").strftime('%B %Y')
            to = employment[:period][:to] ? Date.parse("01-#{employment[:period][:to]}").strftime('%B %Y') : 'Present'
            text "#{from} - #{to}", align: :right
            fill_color '000000'
          end
        end
        move_up 75

        font(ROBOTO, size: 12) do
          text employment[:company][:summary]
        end

        move_down 15

        employment[:roles].each do |role|
          font(ROBOTO_BOLD, size: 12) do
            text role[:title]
          end
          move_down 1
          font(ROBOTO, size: 12) do
            text role[:summary]
          end

          move_down 7

          font(ROBOTO, size: 10) do
            fill_color '999999'
            text 'Major achievements:'
            fill_color '000000'
          end

          move_down 2

          role[:major_achievements].each do |achievement|
            font(ROBOTO, size: 12) do
              text "<u>#{achievement[:title]}</u>", inline_format: true
            end
            move_down 2
            font(ROBOTO, size: 12) do
              text achievement[:description]
            end
            move_down 2
            font(ROBOTO, size: 12) do
              text "Technologies: #{achievement[:technologies].join(', ')}"
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
    @payload[:education].each do |education|
      span(@width - 170, position: :right) do
        bounding_box [-170, 0], width: 150, height: 60 do
          font(PATUA, size: 15) do
            text education[:institution][:name], align: :right
          end

          font(ROBOTO, size: 8) do
            fill_color 'bbbbbb'
            text education[:institution][:website], align: :right
            fill_color '000000'
          end

          move_down 2
          font(ROBOTO, size: 9) do
            fill_color '666666'
            from = Date.parse("01-#{education[:period][:from]}").strftime('%B %Y')
            to = education[:period][:to] ? Date.parse("01-#{education[:period][:to]}").strftime('%B %Y') : 'Present'
            text "#{from} - #{to}", align: :right
            fill_color '000000'
          end
        end
        move_up 55

        font(ROBOTO, size: 12) do
          text education[:summary]
        end
        move_down 60
      end
    end
  end

  def location
    font(ROBOTO, size: 14) do
      text "#{@payload[:location][:city]}, #{@payload[:location][:country]}", align: :center
    end
  end
end
