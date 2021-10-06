class Parser
  Resume = Struct.new :name, :image, :summary, :employments, :trainings, :technologies, :side_projects, :location, :errors do
    def invalid?
      errors.any?
    end

    def valid?
      errors.blank?
    end

    def experience_from_year
      employments.map { |employment| employment.period.from.year }.min
    end

    def training_from_year
      trainings.map { |training| training.period.from.year }.min
    end

    def side_projects_from_year
      side_projects.map { |side_project| side_project.period.from.year }.min
    end

    def filename
      if name.present?
        resume.name.gsub(' ', '-').downcase
      else
        'noname'
      end
    end
  end

  Result = Struct.new :resume, :error

  Employment = Struct.new :employer, :summary, :period, :roles
  Employer = Struct.new :name, :website
  Period = Struct.new :from, :to
  MonthAndYear = Struct.new :month, :year
  Role = Struct.new :title, :summary, :achievements
  Achievement = Struct.new :title, :summary, :technologies
  Training = Struct.new :institution, :summary, :period
  Institution = Struct.new :name, :website
  Project = Struct.new :name, :website, :online, :period, :summary
  Technology = Struct.new :name, :website, :recently_used, :can_mentor, :knowledge_of_best_practices, :knowledge_of_features, :task_complexity
  Location = Struct.new :city, :state, :country do
    def to_s
      "#{city}#{state ? ' ' + state : ''}, #{country}"
    end
  end

  class << self
    def execute(payload)
      new(payload).execute
    end
  end

  def initialize(payload)
    @payload = payload
  end

  def execute
    json = JSON.parse(@payload).with_indifferent_access

    name = json[:name]
    image = json[:image]
    summary = json[:summary]
    employments = parse_employments json[:employments]
    trainings = parse_trainings json[:trainings]
    technologies = parse_technologies json[:technologies]
    side_projects = parse_side_projects json[:side_projects]
    location = parse_location json[:location]

    if name.present? && summary.present? && employments.any?
      Resume.new name, image, summary, employments, trainings, technologies, side_projects, location, []
    else
      Resume.new nil, nil, nil, [], [], [], [], nil, [<<~ERROR]
          Your resume should have at least a name, a short summary of you and some employment history.
          Without this as minimum, it will look empty.
        ERROR
    end
  rescue JSON::ParserError
    Resume.new nil, nil, nil, [], [], [], nil, ['Invalid JSON']
  end

  private

  def parse_employments(employments)
    return [] unless employments.present?

    employments.map do |employment|
      employer = Employer.new employment[:employer][:name], employment[:employer][:website]

      roles =
        employment[:roles].map do |role|
          achievements =
            role[:major_achievements].map do |achievement|
              Achievement.new achievement[:title], achievement[:summary], achievement[:technologies]
            end

          Role.new role[:title], role[:summary], achievements
        end

      Employment.new employer, employment[:summary], period_from(employment[:period]), roles
    end
  end

  def parse_trainings(trainings)
    return [] unless trainings.present?

    trainings.map do |training|
      institution = Institution.new training[:institution][:name], training[:institution][:website]

      Training.new institution, training[:summary], period_from(training[:period])
    end
  end

  def parse_technologies(technologies)
    return [] unless technologies.present?

    technologies.map do |technology|
      Technology.new technology[:name],
                     technology[:website],
                     technology[:recently_used],
                     technology[:can_mentor],
                     technology[:knowledge_of_best_practices],
                     technology[:knowledge_of_features],
                     technology[:task_complexity]
    end
  end

  def parse_side_projects(side_projects)
    return [] unless side_projects.present?

    side_projects.map do |side_project|
      Project.new side_project[:name],
                  side_project[:website],
                  side_project[:online],
                  period_from(side_project[:period]),
                  side_project[:summary]
    end
  end

  def parse_location(location)
    return nil unless location.present?

    Location.new location[:city], location[:state], location[:country]
  end

  def period_from(json)
    from = json[:from] ? MonthAndYear.new(*json[:from].split('-').map(&:to_i)) : nil
    to = json[:to] ? MonthAndYear.new(*json[:to].split('-').map(&:to_i)) : nil

    Period.new from, to
  end
end
