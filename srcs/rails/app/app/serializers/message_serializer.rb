class MessageSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :channel_id, :username, :avatar, :body, :date, :login

  end
