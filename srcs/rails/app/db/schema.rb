# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_02_01_203706) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "blocked_users", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "target_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_blocked_users_on_user_id"
  end

  create_table "channel_users", force: :cascade do |t|
    t.bigint "channel_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "owner"
    t.boolean "admin"
    t.datetime "ban_date"
    t.datetime "mute_date"
    t.index ["channel_id"], name: "index_channel_users_on_channel_id"
    t.index ["user_id"], name: "index_channel_users_on_user_id"
  end

  create_table "channels", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "public"
    t.boolean "private"
    t.string "password"
    t.boolean "direct", default: false
  end

  create_table "friendships", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "friend_id", null: false
    t.boolean "accepted", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["friend_id"], name: "index_friendships_on_friend_id"
    t.index ["user_id"], name: "index_friendships_on_user_id"
  end

  create_table "game_rooms", force: :cascade do |t|
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "status"
    t.integer "number_player"
    t.integer "player_score"
    t.integer "opponent_score"
    t.integer "winner_id"
    t.integer "winner_score"
    t.string "game_type"
    t.bigint "player_id"
    t.bigint "opponent_id"
    t.boolean "ladder", default: false
    t.bigint "tournament_id"
    t.index ["opponent_id"], name: "index_game_rooms_on_opponent_id"
    t.index ["player_id"], name: "index_game_rooms_on_player_id"
    t.index ["tournament_id"], name: "index_game_rooms_on_tournament_id"
  end

  create_table "guilds", force: :cascade do |t|
    t.string "name"
    t.string "anagram"
    t.integer "score"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "war_invites"
    t.boolean "isinwar"
    t.integer "present_war_id"
    t.integer "wt_game_invite"
    t.boolean "isinwtgame"
    t.datetime "wt_date_to_answer"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "channel_id", null: false
    t.bigint "user_id", null: false
    t.text "body"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["channel_id"], name: "index_messages_on_channel_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "tournament_users", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "tournament_id", null: false
    t.integer "level"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["tournament_id"], name: "index_tournament_users_on_tournament_id"
    t.index ["user_id"], name: "index_tournament_users_on_user_id"
  end

  create_table "tournaments", force: :cascade do |t|
    t.string "name"
    t.datetime "start_date"
    t.datetime "end_date"
    t.datetime "registration_start"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "login"
    t.string "avatar_url"
    t.string "guild"
    t.integer "wins"
    t.integer "losses"
    t.boolean "admin"
    t.boolean "online"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "password_digest"
    t.string "token"
    t.bigint "guild_id"
    t.string "otp_secret_key"
    t.boolean "tfa"
    t.boolean "guild_owner"
    t.boolean "guild_officer"
    t.integer "guild_invites"
    t.boolean "guild_locked"
    t.datetime "banned_until"
    t.integer "ladder_score", default: 1000
    t.index ["guild_id"], name: "index_users_on_guild_id"
  end

  create_table "wars", force: :cascade do |t|
    t.integer "guild1_id", null: false
    t.integer "guild2_id", null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.datetime "wt_start"
    t.datetime "wt_end"
    t.integer "wt_max_unanswers"
    t.boolean "add_count_all"
    t.integer "guild1_score"
    t.integer "guild2_score"
    t.integer "prize"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "guild1_unanswers"
    t.integer "guild2_unanswers"
    t.integer "guild_win"
    t.boolean "war_closed"
    t.integer "wt_time_to_answer"
  end

  add_foreign_key "blocked_users", "users"
  add_foreign_key "channel_users", "channels"
  add_foreign_key "channel_users", "users"
  add_foreign_key "friendships", "users"
  add_foreign_key "friendships", "users", column: "friend_id"
  add_foreign_key "game_rooms", "tournaments"
  add_foreign_key "game_rooms", "users", column: "opponent_id"
  add_foreign_key "game_rooms", "users", column: "player_id"
  add_foreign_key "messages", "channels"
  add_foreign_key "messages", "users"
  add_foreign_key "tournament_users", "tournaments"
  add_foreign_key "tournament_users", "users"
  add_foreign_key "users", "guilds"
  add_foreign_key "wars", "guilds", column: "guild1_id"
  add_foreign_key "wars", "guilds", column: "guild2_id"
end
