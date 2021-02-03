class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  def self.starts_with(column_name, prefix)
		where("lower(#{column_name}) like ?", "#{prefix.downcase}%")
	end
end
