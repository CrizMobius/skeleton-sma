class ApplicationController
    module Views
	class Results < Mustache
            def limit
                [{:n => '10'}, {:n => '20'}, {:n => '30'}, {:n => '40'}, {:n => '50'}, {:n => '60'}, {:n => '70'}, {:n => '80'}, {:n => '90'}, {:n => '100'}]
            end

            def messages
                @messages
            end
	end
    end
end
