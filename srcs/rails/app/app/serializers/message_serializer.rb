class MessageSerializer < ActiveModel::Serializer
  attributes :id, :channel_id, :username, :body, :date
  end
  