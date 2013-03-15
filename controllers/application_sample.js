var settings   = "";
var pageTitle  = "NodeACS CMS"
var menuSelect = "login";

var ACS = require('acs').ACS;
var credentials = {
	appkey: 'KEY_GOES_HERE',
	key: 'KEY_GOES_HERE',
	secret: 'KEY_GOES_HERE'
}

ACS.init(credentials.key, credentials.secret);

function index(req, res) {
	res.render('index', { 
		title: pageTitle,
		menu: menuSelect,
	});
};

function indexpost(req, res) {
  ACS.Users.login({
        login: req.body.email, 
        password: req.body.password
    }, function(data) {
		if ( data.success ){ 
			req.session.user = {
				session_id: data.meta.session_id,
				user_id: data.users[0].id,
				first_name: data.users[0].first_name,
				last_name: data.users[0].last_name,
				role: data.users[0].role,
				email: data.users[0].email
			};
			// req["session"]["user"] = 
			console.log( 'session var' + JSON.stringify(req.session.user));
			console.log( 'success response: ' + JSON.stringify(data) );
			res.redirect('/home');
		}else{
			console.log( 'login error: ' + JSON.stringify(data) );
			res.render('index', { 
				title: pageTitle,
				message: data.message,
				menu: menuSelect
			});
		}

    }, req, res);

};

function home(req,res){
	console.log('session id is: ' + JSON.stringify(req.session) );
	res.render('home', {title: pageTitle, menu: 'home', user: req.session.user });
};

function logout(req,res){
	ACS.Users.logout(function (e) {
	    if (e.success) {
		   delete req.session.user;
	       console.log('Success: Logged out');
			res.redirect('/');
	    } else {
	        console.warn('Error:\\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
};

function errorpage(req,res){
	console.log('session id is: ' + JSON.stringify(req.session) );
	res.render('error', {title: pageTitle });	
};