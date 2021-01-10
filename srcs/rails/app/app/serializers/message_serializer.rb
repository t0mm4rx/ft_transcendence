class MessageSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :channel_id, :username, :body, :date
  end
