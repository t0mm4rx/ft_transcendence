class TournamentSerializer < ActiveModel::Serializer
  attributes :id, :name, :start, :registration_start, :registered, :title, :finished

  has_one :winner, serializer: FriendSerializer

  def start
    object.start_date.to_s
  end
  def registration_start
    object.registration_start.to_s
  end
  def registered
    !!TournamentUser.find_by(user_id: current_user.id, tournament_id: self.object.id)
  end

  def winner
    User.find(object.winner.user_id) if object.winner
  end
end

