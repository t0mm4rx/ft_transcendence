require 'rails_helper'
=begin
new test specific to controllers, more like a unit test,
we want to test the specific controller action
=end
RSpec.describe Api::UsersController, type: :controller do
	it 'has a max limit of 100' do
		expect(User).to receive(:limit).with(100).and_call_original

		get :index, params: { limit: 999 }
	end
end
