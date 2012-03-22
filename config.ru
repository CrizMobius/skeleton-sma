require 'sinatra/base'

Dir.glob('./{helpers,controllers}/*.rb').each { |file| require file }

run Rack::Cascade.new [AuthenticationController, UserController, TaggingController, EvaluateController, ResultsController]
