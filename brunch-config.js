exports.config = {
	files:{
		javascripts:{
			joinTo:'js/app.js',
			order:{
				before: [
					'templates/luxy/public/js/libs/jquery-1.11.1.min.js',
					'templates/luxy/public/js/libs/modernizr.custom.js'
				]
			}
		},
		stylesheets:{
			joinTo:'css/all.css'
		}
	},
	paths:{
		'public':'public',
		watched:['templates/luxy/public']
	},
//	optimize:true
};