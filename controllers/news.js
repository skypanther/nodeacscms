var ACS = require('acs').ACS;
var URL = require("url");

var pageTitle  = 'NodeACS CMS';

function getNews(req, res){
	var url = require('url').parse(req.url, true),
		articles = [];

	var p = url.query.page || 1;
	var o = url.query.order || "updated_at";
	
	ACS.Posts.query({
	    page: 1,
	    per_page: 20
	}, function (e) {
		if (e.success && e.meta.status === "ok") {
			console.log('posts retrieved')
			user = req.session.user || user;
	        for (var i = 0; i < e.posts.length; i++) {
	            articles.push(e.posts[i]);
	        }
		} else {
			console.log('error + ' + JSON.stringify(e))
		}
		
		res.render('news', { 
			articles: articles,
			menu: 'news', 
			title: pageTitle,
			total_pages: e.meta.total_pages,
			page: e.meta.page,
			user: user
		});
	});
};

function show(req, res) {

	var url = require('url').parse(req.url, true),
		articles = [{id:0,title:'',updated_at:'',contents:''}];

	ACS.Posts.show({
        post_id: url.query.id
	}, function(data){
		if(data.success && data.meta.status === "ok"){
			user = req.session.user;
			articles = data.posts;
		} else {
			console.log('error + ' + JSON.stringify(data))
		}
		res.render('article-detail', {
			article: articles[0],
			menu: 'news', 
			user: user,
			edit: url.query.edit,
			title: pageTitle
		});
	});
}
