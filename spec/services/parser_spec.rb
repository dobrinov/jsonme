require 'rails_helper'

describe Parser do
  it 'works' do
    json = <<~JSON
      {
        "name": "John Doe",
        "summary": "Works as a test dummy.",
        "employments": [
          {
            "employer": {
              "name": "Example Inc.",
              "website": "https://www.example.com/"
            },
            "period": {"from": "01-1999", "to": null},
            "summary": "This is an example company in which I was mostly a test dummy.",
            "roles": [
              {
                "title": "Test Dummy",
                "summary": "I play a vital role in ensuring that software works.",
                "majorAchievements": [
                  {
                    "title": "Released JsonMe",
                    "summary": "I helped Deyan release JsonMe.",
                    "technologies": ["Ruby on Rails"]
                  }
                ]
              }
            ]
          }
        ],
        "trainings": [
          {
            "institution": {
              "name": "Test Dummy Institute",
              "website": "https://uni.example.com/"
            },
            "period": {"from": "01-1995", "to": "06-1998"},
            "summary": "Quality Assurance"
          }
        ],
        "location": {
          "city": "Sofia",
          "state": null,
          "country": "Bulgaria"
        }
      }
    JSON

    p Parser.execute json
  end
end
