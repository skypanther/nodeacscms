var ACS = require('acs').ACS;


var PUSH_COUNT_KEY = "PUSH_COUNT";


function notify(req, res){

	var channel = req.body.channel;
	var to_ids = req.body.to_ids;


	ACS.KeyValues.increment({
		name:PUSH_COUNT_KEY,
		value: 1,
		access_private: true,
	}, function(e){

		ACS.PushNotification.notify({
			
		})
	})


}