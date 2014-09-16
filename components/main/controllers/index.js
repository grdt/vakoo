var Controller = function(){

    var that = this;

    this.register = function(){
        this.url.response.send({aza:'aza'});
    }

    this.page = function(){
        var page = this.model('page');

        this.render('page', {page: page});

    }

	this.index = function() {
		this.tmpl().display('main_page',{
			title:'vakoo page title',
			zaz:'olo',
			aza:'lol'
		});
	}

	this.error = function(){
		this.query.response.statusCode = 404;
		this.tmpl().render('errors.404');
	}

	
	this.feedback = function(){
		if(this.isAjax()){
			this.model('feedback').setAttributes(this.post()).save(function(){
				that.vakoo.sendMail(
					'a@pasa.me',
					'LUXYsexy Feedback',
					that.tmpl().render('feedback',that.post(),true)
				);
			});
			this.json({success:true});
		}
	}

	this.search = function(){
		this.tmpl().display('search',{
			title: 'Поиск "' + this.get('text') + '"'
		});
	}

	this.checkSkype = function(){

//		var loginCache = this.vakoo.global('loginCache') || {};
//		var loginCache = {};

		if(this.get('login')){

//			if(loginCache[this.get('login')]){
//				that.json(loginCache[this.get('login')]);
//				console.log('cache',this.get('login'),loginCache[this.get('login')]);
//				return;
//			}

			var http = require('https'),
				querystring = require('querystring'),
				postData = querystring.stringify({
					new_username:this.get('login'),
					skypeNameHelper:false
				}),
				data = '',
				req = http.request({
				host:'login.skype.com',
				path:'/json/validator',
				method:'POST',
				headers:{
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': postData.length
				}
			},function(res){
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					data += chunk;
				});

				res.on('end',function(){
					data = JSON.parse(data);
					if(data.status == 406){
//						if(!loginCache[that.get('login')]){
//							loginCache[that.get('login')] = {success:true,available:true};
//						}
						that.json({success:true,available:true});
					}else{
//						if(!loginCache[that.get('login')]){
//							loginCache[that.get('login')] = {success:true,available:false};
//						}
						that.json({success:true,available:false});
					}

//					that.vakoo.global('loginCache',loginCache);
				});
			});

			req.write(postData);
			req.end();

		}else{
			this.json({success:false});
		}
	}
	
    return this;
}


module.exports = Controller;