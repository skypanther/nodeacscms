var ACS = require('acs').ACS;
var logger = require('acs').logger;
var EventEmitter = require('events').EventEmitter; 
var https = require('http');
var sessionID = null;

var stocks, results=[], evt_count=0;

function getStockQuotes(req, res) {
	var uid = req.query.uid;
	var Event = new EventEmitter;

	// SETUP EVENT LISTENER
	Event.on("HTTP_COMPLETE", function(e){
		console.log("EVENT: HTTP_COMPLETE");
		evt_count++;
		console.log(evt_count);
		if(evt_count === stocks.length){
			console.log("close response");

			res.write(JSON.stringify(results));
			res.end();
		}
	});

	ACS.Objects.query({
		page: 1,
		per_page: 50,
		classname: "stocks",
		where:{
			user_id: uid,
		}
	},
		function(data){
			console.log(JSON.stringify(data));

			stocks = data.stocks;

			for(var i=0, l=stocks.length; i<l; i++){
				marketOnDemandQuote(stocks[i].symbol);
			}
		}
	)
	

	function marketOnDemandQuote(symbol) {
			var myreq = https.get('http://dev.markitondemand.com/Api/Quote/json?symbol='+symbol, function(r) {
		 	
				r.setEncoding('utf8');
			  	r.on('data', function (chunk) {
			    	console.log(chunk);
			  	
			  		var o={}, d = JSON.parse(chunk);
			  		o.symbol = d.Data.Symbol;
			  		o.name = d.Data.Name;
			  		o.lastPrice = d.Data.LastPrice;
			  		results.push(o);

			  		Event.emit("HTTP_COMPLETE");

			  	});
		});
	}
};
exports.getStockQuotes = getStockQuotes;


