require 'rubygems'
require 'httparty'

class ResultsRetrieve
    def RetrieveClassificationObjects(limit1,filter)
	
	if(filter.strip.empty?)
		#Use this as preliminary adress
		jsonArray = HTTParty.get("http://nosy.pspace.se:8888/corpus?limit=#{limit1}")
		puts "@filters was empty"
	else
		#Use this as preliminary adress
		jsonArray = HTTParty.get("http://nosy.pspace.se:8888/corpus?keywords=#{filter}&limit=#{limit1}")
		puts "@filters was #{filter}"
	end
        return jsonArray      
    end
end
