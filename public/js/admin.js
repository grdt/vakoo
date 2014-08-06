$(document).ready(function () {
	$.get('/admin/?task=shop.orders/count&status=new', function (response) {
		$("#menu-orders").append('&nbsp;<span class="badge">' + response.count + '</span>');
	});
});