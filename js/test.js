// list all name anchor hyperlink
$(".hyperlink[data-id]").each(function(){console.log($(this).text())});

// test validation of name anchor hyperlink
$(".hyperlink[data-id]").each(function(){
	var id = $(this).text().replace(/\s+/,'');
	if($("#"+id)==null)console.log($(this).text());
});

// name RE test
$(".author_block b").each(function(){
	var text = $(this).text().replace(/\s+/g,' ');
	var data = text.match(/((..)|([中台臺][\u4E00-\u9FA5]+))((大學?)|院) \S+[系所班程]\s+[男女]同學 ?[IVX]*/g);
	if(data==null)console.log(text);
})