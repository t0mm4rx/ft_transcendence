FactoryBot.define do
  factory :blocked_user do
    user { nil }
    target_id { "MyString" }
  end
end
