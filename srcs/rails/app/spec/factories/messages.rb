FactoryBot.define do
  factory :message do
    channel { nil }
    user { nil }
    body { "MyText" }
  end
end
