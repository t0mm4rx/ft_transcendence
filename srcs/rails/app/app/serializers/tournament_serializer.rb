class TournamentSerializer < ActiveModel::Serializer
  attributes :id, :name, :start, :end, :registration_start

  def start
    # object.start_date.to_f * 1000
    object.start_date.to_s
  end
  def end
    # object.end_date.to_f * 1000
    object.end_date.to_s
  end
  def registration_start
    # object.registration_start.to_f * 1000
    object.registration_start.to_s
  end
end
