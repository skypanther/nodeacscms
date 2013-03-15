var ACS = require('acs').ACS;
var URL = require("url");

var pageTitle  = 'NodeACS CMS';


function setupDummyAccounts(){
	console.log("setupDummyAccounts()");

	var users = require("../data/users");
	console.log("Users: " + JSON.stringify(users));
	
	var result;
	if(users.data && users.data.length) {
		for(var i=0,l=users.data.length; i<l; i++){
			ACS.Users.create({
				username: users.data[i].username,
				email: users.data[i].email,
				first_name: users.data[i].first_name,
				last_name: users.data[i].last_name,
				role: users.data[i].role,
				custom_fields: users.data[i].custom_fields,
				password: users.data[i].password,
				password_confirmation: users.data[i].password,
			}, function(e){
				result = e.succes;
			})
		}
	}

	return result;
}

function getUsers(req, res){
	console.log("setupDummyAccounts="+req.url.setupDummyAccounts);
	var url = require('url').parse(req.url, true);

	if(url.query.setupDummyAccounts) {
		setupDummyAccounts();
	}
	
	var p = url.query.page || 1;
	var o = url.query.order || "last_name";
	
	ACS.Users.query({
		page: p,
		per_page: 20,
		order: o
	}, function(e){
		
		
		if (e.success && e.meta.status === "ok") {
			//TODO - Remove debug user/users
			user = req.session.user || user;
			users = e.users || users;
		}
		
		res.render('users', { 
			users: users,
			menu: 'users', 
			user: user,
			title: pageTitle,
			total_pages: e.meta.total_pages,
			page: e.meta.page
		});
	});
};

function show(req, res) {

	var url = require('url').parse(req.url, true);

	console.log(url.query.id);
	console.log(url.query.edit);
	
	ACS.Users.query({
		where: {email: url.query.email}
	}, function(data){
		
		if(data.success && data.meta.status === "ok"){
			user = req.session.user;
			users = data.users;
		}
		
		res.render('user-detail', {
			users: users[0],
			user: user,
			menu: 'users',
			edit: url.query.edit,
			title: pageTitle + " - "+ users[0].first_name + " " + users[0].last_name
		});
	});
}


function addUser(req, res){
	
	var first_name = req.url.first_name;
	var last_name = req.url.last_name
	
	
}
