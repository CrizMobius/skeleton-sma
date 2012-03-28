require_relative 'application_controller'
require_relative '../model/results_retrieve.rb'
require_relative '../model/modify_algorithms.rb'
require 'json'

class ResultsController < ApplicationController

	#Displays 10 messages for classifier by default using the evaluate view
	get '/results/?' do
		count = 10
		retriever = ResultsRetrieve.new()
		
		if(params.has_key?('filter'))  
			@filters = filterFunction('filter')
		else
			@filters = ''
		end
		@messages = retriever.RetrieveClassificationObjects(count,@filters)
		mustache :results
	end
	#Displays a given limit of messages from classifier using the evaluate view
	post '/results/limit' do
		count = params.fetch('limit')
		retriever = ResultsRetrieve.new()
		if(params.has_key?('filter'))
			@filters = filterFunction('filter')
		else
			@filters = ''
		end 
		@messages = retriever.RetrieveClassificationObjects(count,@filters)
		@keywords = params.fetch('filter')
		mustache :results
	end
	#this is temporary solution until result form provides dual button submits
	get '/results/static' do
		mustache :static_graph
	end

	post '/results/static' do
		mustache :static_graph
	end
	#Google
	post '/results/map' do
		mustache :google_map
	end

	get '/results/edit' do
		mustache :edit_algorithms
	end

	post '/results/modify' do
		param1 = params.fetch('parameter1')
		param2 = params.fetch('parameter2')
		param3 = params.fetch('parameter3')
		param4 = params.fetch('parameter4')
		param5 = params.fetch('parameter5')
		param6 = params.fetch('parameter6')
		modifier = ModifyAlgorithms.new()
		modifier.modifyAlgorithms(param1,param2,param3,param4,param5,param6)	
	end

	get '/results/data?' do
		content_type :json
		retriever = ResultsRetrieve.new()
		thresholds = params[:thresholds]
		thresholds = thresholds.gsub('"','%22')
		thresholds = thresholds.gsub('{','%7B')
		thresholds = thresholds.gsub('}','%7D')
		startTime = params[:start_time]
		endTime = params[:end_time]
		limit = params[:limit]
		jsonArray = retriever.RetrieveJSON(thresholds,startTime,endTime,limit)
		puts jsonArray
		jsonArray.to_json
	end

	def filterFunction(filter)
		filters = params.fetch('filter') # Get the searchfilters.
			filters = filters.gsub(' ', ',') # Replaces all the ' ' with ','
			sanitized = filters.split(',')   # Splits all the strings at ','
			sanitized.delete_if(&:empty?)    # "Delete if empty"
			filters = ''
			filters.concat('%7B')
			sanitized.each do |value|
				filters = filters.concat('%22').concat(value).concat('%22:0.9') # Join two strings together.
			end
			filters.concat('%7D')
			#filters = filters.chomp(',')     # Remove the last ',' from filters.
			return filters
	end
end
