FactoryBot.define do
  factory :friendship do
    user { nil }
    friend_id { 1 }
    accepted { false }
  end
end
