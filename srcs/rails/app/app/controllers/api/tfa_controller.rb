module Api
	class TfaController < ApplicationController
		def index
			user = User.find_by_id(current_user.id)
			totp = ROTP::TOTP.new(user.otp_secret_key)
			p totp.now #display the access code
			if totp.verify(params[:code])
				render json: {msg: "TFA succeed"}
			else
				render json: {error: "Code is not good"}, status: :forbidden
		end

		def create
			@user = User.find_by_id(current_user.id)
			totp = ROTP::TOTP.new(@user.otp_secret_key)
			@user.tfa = true
			@user.save
			render json: {uri: totp.provisioning_uri("pongponglebest") }, status: :created
		end
		end
	end
end
