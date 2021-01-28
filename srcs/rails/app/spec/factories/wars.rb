FactoryBot.define do
  factory :war do
    guild1_id { 1 }
    guild2_id { 1 }
   # start { "2021-01-25 11:25:39" }
   # end { "2021-01-25 11:25:39" }
    wt_start { "2021-01-25 11:25:39" }
    wt_end { "2021-01-25 11:25:39" }
    wt_max_unanswers { 1 }
    add_count_all { false }
    guild1_score { 1 }
    guild2_score { 1 }
    prize { 1 }
  end
end
