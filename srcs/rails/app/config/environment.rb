# Load the Rails application.
require_relative "application"
require 'rufus-scheduler'
s = Rufus::Scheduler.singleton

# Initialize the Rails application.
Rails.application.initialize!
