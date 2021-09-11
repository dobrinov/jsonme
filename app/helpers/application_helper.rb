module ApplicationHelper
  def format_period(from, to)
    from = Date.parse("01-#{from}").strftime('%B %Y')
    to = to ? Date.parse("01-#{to}").strftime('%B %Y') : 'Present'

    "#{from} - #{to}"
  end

  def section(title, &block)
    tag.div class: 'section' do
      [
        tag.h2(title, class: 'heading'),
        capture(&block),
      ].join.html_safe
    end
  end

  def timeline(from:, &block)
    tag.div class: 'timeline' do
      [
        tag.aside('present'),
        tag.div(capture(&block)),
        tag.aside(from),
      ].join.html_safe
    end
  end
end
