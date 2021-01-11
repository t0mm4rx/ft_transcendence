class BlockedUserSerializer < ActiveModel::Serializer
	attributes :target_id, :user_id
end
