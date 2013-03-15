var ACS = require('acs').ACS;

function init(req, res){
	var url = require('url').parse(req.url, true);

	if(url.query.module) {
		
		ACS.Objects.query({
			classname: "modules",
			module_name: url.query.module
		}, function(e){


			if (e.success && e.meta.status === "ok") {
				//TODO - Remove debug user/users
				user = req.session.user || {};

				res.render('module_config', { 
					menu: url.query.module, 
					user: user,
					title: url.query.module,
					module: e.modules[0],
					edit: url.query.edit || "true"
				});
			}
		});
	}

	else {
			res.render('error', {});
	}
};