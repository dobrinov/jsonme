class Parser
  Resume = Struct.new :name, :image, :summary, :employments, :trainings, :location, :errors do
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

    employments =
      json[:employments].map do |employment|
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

    trainings =
      json[:trainings].map do |training|
        institution = Institution.new training[:institution][:name], training[:institution][:website]

        Training.new institution, training[:summary], period_from(training[:period])
      end

    location = Location.new json[:location][:city], json[:location][:state], json[:location][:country]

    Resume.new json[:name], json[:image], json[:summary], employments, trainings, location, []
  rescue JSON::ParserError
    Resume.new nil, nil, nil, [], [], nil, ['Invalid JSON']
  end

  private

  def period_from(json)
    from = json[:from] ? MonthAndYear.new(*json[:from].split('-').map(&:to_i)) : nil
    to = json[:to] ? MonthAndYear.new(*json[:to].split('-').map(&:to_i)) : nil

    Period.new from, to
  end
end
