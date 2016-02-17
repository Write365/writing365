jQuery.fn.wordCount = function(params){
	var p = {
		counterElement:"display_count"
	};
	var total_words;
	
	if(params) {
		jQuery.extend(p, params);
	}
	
	//for each keypress function on text areas
	this.keypress(function()
	{ 
		total_words=this.value.split(/[\s\.\?]+/).length;
		jQuery('#'+p.counterElement).html(total_words);
	});	
	this.blur(function()
	{
		jQuery(this).keypress();
	});
	this.focus(function()
	{
		jQuery(this).keypress();
	});
};

jQuery(document).ready(function() { 
	jQuery('#edit-body-und-0-value').bind('copy paste cut', function (e) {
        e.preventDefault();
	});	
    jQuery('#edit-body-und-0-value').wordCount({counterElement:"wordcount"});

});
