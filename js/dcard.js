function mainFun(obj)
{
	var data = $(obj).html();
	var html = data;
	var urls = html.replace(/<br>/g,' ').match(/\bhttps?:\/\/\S+\b/g);
	var names = html.match(/((..)|([中台臺][\u4E00-\u9FA5]+))((大學?)|院) \S+[系所班程]\s+[男女]同學 ?[IVX]*/g);
	var floors = html.match(/(([^%\w][Bb])|(^[Bb]))\d{1,3}\b/g);
	var hideBlock = html.match(/(<br>){7,}(.*)/);
	var origin = data;
	if(urls!=null)
	{
		for(var i=0;i<urls.length;i++)
		{
			var content = '<a class="hyperlink" style="color:blue" href="'+urls[i]+'">'+urls[i]+'</a>';
			origin = origin.replace(urls[i],content);
		}
	}
	if(names!=null)
	{
		for(var i=0;i<names.length;i++)
		{
			var id = getID(names[i]);
			origin = origin.replace(names[i],'<a class="hyperlink" style="color:blue" data-id="'+id+'" href="#">'+names[i]+'</a>');
		}
	}
	if(floors!=null)
	{
		var floorDictionary = {};
		for(var i=0;i<floors.length;i++)
		{
			//floor match pattern may be ';b1'
			if(floors[i][0]!='b' && floors[i][0]!='B')floors[i]=floors[i].substr(1);
			floorDictionary[floors[i]] = floors[i];
		}
		for(var element in floorDictionary)
		{
			//bug == may cause some problem like 'b1 b2 %b1';
			var re = new RegExp(element,"g");
			origin = origin.replace(re,'<a class="hyperlink" style="color:blue" data-floor="'+element+'" href="#">'+element+'</a>');
		}
	}
	if(hideBlock!=null)
	{
		var showBtn = '<input type="button" class="showBtn" value="More">';
		var content = '<br>' + showBtn + '<div class="hideDiv"><br>' +hideBlock[2]+ '</div>';
		origin = origin.replace(hideBlock[0],content);
	}
	$(obj).html(origin);
}
$(".article").each(function(){
	mainFun(this);
})
$('.comment_block p').each(function(){
	mainFun(this);
})

//Start--show the hiding div
$(".showBtn").click(function(){
	$(this).hide();
	$(this).siblings(".hideDiv").slideToggle();
});
$(".hideDiv").each(function(){
	$(this).slideToggle();
});
//End--show the hiding div

//Start--SetID for elements
$('.author_block').each(function(){
	var text = $(this).text();
	var id = getID(text);
	$(this).attr('id',id);
})

$(".floor_num_block").each(function(){
	var id = $(this).text();
	$(this).attr('id',id);
})

function getID(text)
{
	var idArray = text.match(/(\S+[大學院])\s+(\S+[系所班程(狄卡)])\s*(\S+)\s*([VIX]*)/);
	var id='';
	if(idArray==null)alert(text);
	else
	for(i=1;i<idArray.length;i++)
	{
		id = id.concat(idArray[i]);
	}
	return id;
}
//End--SetID for elements

//Start--Reply with quote
$(".floor_num_block").click(function(){
	var floor = $(this).text();
	var name = $(this).siblings(".author_block").text().trim().replace(/\s+/g,' ');
	var text = '>> '+floor+' '+name;
	$(".comment_content").text(text);
	$("#go_to_reply>button").click();
})
$(".floor_num_block").hover(
	function(){
		$(this).css('cursor','pointer');
	}, 
	function() {
		$(this).css('cursor','auto');
	}
)
//End--Reply with quote

//Start--anchor hyperlink and its effect
$(".hyperlink[data-id]").click(function(){
	var id = $(this).attr('data-id');
	moveTo(this,id);
})

$(".hyperlink[data-floor]").click(function(){
	var id = $(this).attr('data-floor');
	return moveTo(this,id);
})

function moveTo(originObj,targetId)
{
	var nowScrollTop = $(this).scrollTop();
	var originObj = $(originObj).parent().parent().parent();
	var nearestTarget = getNearestTargetAbove(originObj,targetId);
	var target = $(nearestTarget).parent().parent();
	
	if(target==null||target.offset()==null)return false; //in case 安價 unvalid floor anchor hyperlink
	var targetTop = target.offset().top;
	$("html, body").animate({ scrollTop: targetTop-100},1000,"swing",highlight(target));
	$(".back").remove();
	target.children().children('.acting_block').append('<input class="back" type="button" value="back" />');
	$(".back").click(function(){
		$("html, body").animate({ scrollTop: nowScrollTop},1000,"swing",highlight(originObj));
		$(this).remove();
	})
}

function highlight(target)
{
	var originColor = $(target).siblings(":last").css('background-color');
	$(target).animate({ backgroundColor: "rgb(255, 255, 125)"},1000,'swing')
	.delay(700)
	.animate({ backgroundColor: originColor},1000,"swing");
}

function getNearestTargetAbove(originObj,targetId)
{
	var originOffset = $(originObj).offset().top;
	var objArray = $("#"+targetId);
	for(var i=0;i<objArray.length;i++)
	{
		if($(objArray[i]).offset().top>originOffset)break;
	}
	return objArray[i-1]; 
}
//End--anchor hyperlink and its effect

$('a.hyperlink').hover(
  function () {
    $(this).css("color", "red");
  }, 
  function () {
    $(this).css("color", "blue");
  }
);

//Start--Personal settings for embed view and preview image
chrome.storage.sync.get(null,function(items) 
{
    for(var id in items)
	{
		var val = items[id];
		if(val==true)
		{
			switch(id)
			{
				case 'embedYoutubeVideo': embedYoutubeVideo();break;
				case 'previewImg': previewImg();break;
			}
		}
	}
})

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		if(storageChange.newValue==true)
		{
			switch(key)
			{
				case 'embedYoutubeVideo': embedYoutubeVideo();break;
				case 'previewImg': previewImg();break;
			}
		}
		console.log('Storage key "%s" in namespace "%s" changed. ' +
					'Old value was "%s", new value is "%s".',
					key,
					namespace,
					storageChange.oldValue,
					storageChange.newValue);
	}
});

function embedYoutubeVideo()
{
	$(".hyperlink").each(function(){
		var url = $(this).attr('href');
		if(url.match(/www.youtube.com/))
		{
			var pattern = url.match(/v=([^&]*)(&list=(.*))?/);
			var videoID = pattern[1];
			var listID = pattern[3];
			var src = '//www.youtube.com/embed/'+videoID;
			src += listID!=null? '?list='+listID:'';
			content = '<iframe width="420" height="315" src="'+src+'" frameborder="0" allowfullscreen></iframe>';
			$(this).replaceWith(content);
		}
	})
}
function previewImg()
{
	$(".hyperlink").each(function(){
		var url = $(this).attr('href');
		if(url.match(/\.(jpg)|(png)/))
		{
			content = '<br><img src="'+url+'">';
			$(this).replaceWith(content);
		}
	})
	adjustImgSize();
}
function adjustImgSize()
{
	//adjust the image if the size is out of range
	$("img").one('load', function() {
	  var maxWidth = $(".comment").width()-150;
		var width = $(this).width();
		if(width > maxWidth)
		{
			var height = $(this).height() * maxWidth / width;
			width = maxWidth;
			$(this).width(width);
			$(this).height(height);
		}
	}).each(function() {
	  if(this.complete) $(this).load();
	});
}
//End--Personal settings for embed view and preview image

//test case
//http://www.dcard.tw/index.php?p=question&id=1699 for anchor hyperlink
//http://www.dcard.tw/index.php?p=question&id=1668 for url concerned functions
//http://www.dcard.tw/index.php?p=question&id=1815 for show the hiding div
//http://www.dcard.tw/index.php?p=question&id=1809 for youtube embeded