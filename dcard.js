$('.comment_block p').each(function(){
	var data = $(this).html();
	var html = data;
	var urls = html.replace(/<br>/g,' ').match(/\bhttps?:\/\/\S+\b/g);
	var names = html.match(/[\u4E00-\u9FA5]+大學? \S+[系所班程]\s+[男女]同學 ?[IVX]*/g);
	var floors = html.match(/(([^%][Bb])|(^[Bb]))\d{1,3}\b/g);
	var hideBlock = html.match(/(<br>){7,}(.*)/);
	var origin = data;
	if(urls!=null)
	{
		for(var i=0;i<urls.length;i++)
		{
			var content = '<a class="hyperlink" style="color:blue" href="'+urls[i]+'">'+urls[i]+'</a>';
			if(urls[i].match(/\.(jpg)|(png)/))
			{
				content = '<br><img src="'+urls[i]+'">';
				//content = '<br><img src="'+urls[i]+'">';
			}
			else if(urls[i].match(/www.youtube.com/))
			{
				var youtubeID = urls[i].match(/v=(.*)\b/)[1];
				content = '<iframe width="420" height="315" src="//www.youtube.com/embed/'+youtubeID+'" frameborder="0" allowfullscreen></iframe>';
			}
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
			var re = new RegExp(element,"g");
			origin = origin.replace(re,'<a class="hyperlink" style="color:blue" data-floor="'+element+'" href="#">'+element+'</a>');
		}
	}
	if(hideBlock!=null)
	{
		var showBtn = '<input type="button" class="showBtn" value="Show">';
		var content = '<br>' + showBtn + '<div class="hideDiv"><br>' +hideBlock[2]+ '</div>';
		origin = origin.replace(hideBlock[0],content);
	}
	$(this).html(origin);
})

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
	var idArray = text.match(/(\S+大學?)\s+(\S+[系所班程(狄卡)])\s*(\S+)\s*([VIX]*)/);
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

//Start--anchor hyperlink and its effect
$(".hyperlink[data-id]").click(function(){
	var id = $(this).attr('data-id');
	moveTo(this,id);
})

$(".hyperlink[data-floor]").click(function(){
	var id = $(this).attr('data-floor');
	moveTo(this,id);
})

function moveTo(originObj,targetId)
{
	var nowScrollTop = $(this).scrollTop();
	var originObj = $(originObj).parent().parent().parent();
	var nearestTarget = getNearestTargetAbove(originObj,targetId);
	var target = $(nearestTarget).parent().parent();
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
	if($(objArray[i]).offset().top>originOffset)
	break;
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
//$("#go_to_reply>button").click()

//test case
//http://www.dcard.tw/index.php?p=question&id=1699 for anchor hyperlink
//http://www.dcard.tw/index.php?p=question&id=1668 for url concerned functions
//http://www.dcard.tw/index.php?p=question&id=1815 for show the hiding div
//http://www.dcard.tw/index.php?p=question&id=1809 for youtube embeded