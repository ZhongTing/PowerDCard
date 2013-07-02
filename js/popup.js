$(".onoffswitch input[type=checkbox]").click(function(){
	var id = $(this).attr('id');
	var value = $(this).attr('checked')=='checked';
	var dic = {};
	dic[id] = value;
	chrome.storage.sync.set(dic, function() {
  });
})
$(".form-search").submit(function(){
	var searchUrl = 'https://www.google.com.tw/search?hl=zh-TW&as_sitesearch=www.dcard.tw&as_q=';
	var key = $(".form-search input").val();
	if(key!='')
	{
		window.open(searchUrl+key);
	}
})
chrome.storage.sync.get(null,function(items) 
{
    for(var id in items)
	{
		var val = items[id];
		if(val==false)
		{
			$("#"+id).removeAttr('checked');
		}
	}
})