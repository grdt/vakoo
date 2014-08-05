/**
 * @extends CoreAdminController
 * @constructor
 */
var ContentAdminController = function(){
	var that = this;

	var PER_PAGE = 50;

	this.VIEW_NAMESPACE = 'page';

	this.index = function(){
		var where = {};
		if(this.get('type')){
			where = {type:this.get('type')};
		}

		this.module('pagination').get(this.model('page').where(where),PER_PAGE,that.get('p',0),function(pages, pagination){
			that.display('list',{
				pages:pages,
				pagination:pagination
			})
		});

	}

	this.edit = function(){
		this.createReturnUrl();
		this.model('page').where({_id:this.get('id')}).findOne(function(page){

			if(that.post()){
				page.setAttributes(that.post()).save(function(){
					that.setFlash('success','Статья сохранена');
					if(that.post('exit') == '1'){
						that.back();
					}else{
						if(!that.get('id')){
							that.redirect(that.query.mergeUrl('/admin/?task=content.edit&id=' + page._id,{"return":that.get('return','false')}));
						}else{
							that.display('form',{
								page:page
							});
						}
					}
				});
				return;
			}

			that.display('form',{
				page:page
			});
		});
	}
}

module.exports = ContentAdminController;