/* File: words_per_minute.js
 * Version: 7103
 * - moved the jQuery.fn.wordcount into Drupal.behaviors.writing365WordsPerMinute.wpmcounter()
 * - the wpmcounter now uses Drupal.behaviors.writing365Wordcounter.str_word_count instead of its own wordcounter
 * - commented out jQuery.fn.wpmcount
 *
 *
 * Version: 7102
 * Updated: 1/30/2015
 * Changes:
 * - renamed file to words_per_minute.js from wordsperminute.js
 * - initialed total_words = 0 in the wpmcount function. May change the name of this in the future
 * - changed hiddenwordsperminute to hidden_words_per_minute to match the name in module folder
 * - (Added) formula to calculate the total time writing calculated in seconds.
 *		~ The time writing is calculated as the amount of time a user has the textarea selected.
 *	 	~ If a user updates a post, the time spent writing value will be the previous time writing + the new time
 * - changed jQuery(document).ready(function) to Drupal.behaviors
 *		~ this allows us to pass variables from Drupal to the Javascript.
 *		~ commented out old functions that we can switch back to if Drupal.behaviors doesn't work properly
 * x if the user is updating a node, the wpm is overwritten. The old wpm is not included in this. to temporarily
 *	 address this, we will not update wpm in the database when updating a node for now.
 */

(function ($) {
	Drupal.behaviors.writing365WordsPerMinute = {
		//write functions in here like this... call by Drupal.behaviors.writing365WordsPerMinute.function()
		wpmcounter: function() {
			var total_words;
			var journal_area = $('#edit-body-und-0-value');
			var iLastTime = 0;
			var iTime = 0;
			var iTotal = 0;
			var iKeys = 0;
			var total_words = 0;
			var wpm = 0;
			
			journal_area.keypress(function() {
				//calculate the total words here
				total_words = Drupal.behaviors.writing365Wordcounter.str_word_count(journal_area.val());
				
				//write on DOM
				//jQuery('#wpm').html(total_words);
				
				iTime = new Date().getTime();
				if (iLastTime != 0) {
					iKeys++;
					iTotal += iTime - iLastTime;
					iWords = total_words;
					
					//calculate cpm and wpm here
					//cpm = Math.round(iKeys / iTotal * 60000, 2);
					wpm = Math.round(iWords / iTotal * 60000, 2);
					
					//print to hidden field and markup on the form
					$('[name="hidden_words_per_minute"]').val(wpm);			
					//jQuery('#wpm').html(wpm);
				}
				iLastTime = iTime;
				
				});	
				journal_area.blur(function() {
					$(this).keypress();
				});
				journal_area.focus(function() {
					$(this).keypress();
				});
		},
		
		resumeTimer: function() {
			var date = new Date();
			var t = date.toLocaleTimeString();
			$("#edit-fieldset").data("starttime", t);
			var mystarttime = $("#edit-fieldset").data("starttime");
			
			//set timer
			if($("#edit-fieldset").data("timer") === undefined) {
				$("#edit-fieldset").data("start_time", $.now());
				$("#edit-fieldset").data("timer", $.now());
				$('[name="hidden_time_start"]').val($.now());
			} else {
				$("#edit-fieldset").data("timer", $.now());	
			}
			var start_time= $("#edit-fieldset").data("start_time");
		},
		
		pauseTimer: function(initial_time_writing) {
			var date2 = new Date();
			var t2 = date2.toLocaleTimeString();
			var start_of_interval = $("#edit-fieldset").data("timer");
			
			//if this is the first time they're clicking out of the box
			if($("#edit-fieldset").data("total_time") === undefined) {
				$("#edit-fieldset").data("total_time", $.now() - start_of_interval + initial_time_writing*1000);
				var total_time = $("#edit-fieldset").data("total_time");
			} else {
				//cummulative time calculation in msec, will convert to sec when updating the form.
				var total_time = $("#edit-fieldset").data("total_time") + $.now() - start_of_interval;
				$("#edit-fieldset").data("total_time", total_time);
			}
			//write to form
			$('[name="hidden_time_writing"]').val(total_time/1000);
		},
		
		attach: function(context, settings) {
			//passed from module
			var initial_time_writing = Drupal.settings.writing365.initial_time_writing;
			
			//tie function to the body
			Drupal.behaviors.writing365WordsPerMinute.wpmcounter();
			//$('#edit-body-und-0-value').wpmcount({counterElement:"wpmcount"});
			//determine if textbox is selected. Must deselect on window change
			$('#edit-body-und-0-value').click(function() {
				Drupal.behaviors.writing365WordsPerMinute.resumeTimer();
			});
			$('#edit-body-und-0-value').blur(function() {
				Drupal.behaviors.writing365WordsPerMinute.pauseTimer(initial_time_writing);
			});
			
			//this event is to stop the timer when the is typing then switches tabs/minimizes.
			//Without this the timer will continue to run because the journal form is still selected
			$(window).blur(function() {
				$('#edit-title').focus();
				$('#edit-title').blur();
			});
		}
	};
})(jQuery);

//haven't figured out how to wrap this in settings
/*jQuery.fn.wpmcount = function(params){
	var journal_area = jQuery('#edit-body-und-0-value');
	var count2 = jQuery('[name="hidden_wordcount"]').val();
	
	var p = {
		counterElement:"display_count"
	};
	var iLastTime = 0;
	var iTime = 0;
	var iTotal = 0;
	var iKeys = 0;
	var total_words = 0;
	var wpm = 0;
	
	if(params) {
		jQuery.extend(p, params);
	}
	
	//for each keypress function on text areas
	this.keypress(function()
	{ 
		//calculate the total words here
		total_words = this.value.split(/[\s\.\?]+/).length;
		
		//write on DOM
		//jQuery('#wpm').html(total_words);
		
		iTime = new Date().getTime();
		if (iLastTime != 0) {
			iKeys++;
			iTotal += iTime - iLastTime;
			iWords = total_words;
			
			//calculate cpm and wpm here
			//cpm = Math.round(iKeys / iTotal * 60000, 2);
			wpm = Math.round(iWords / iTotal * 60000, 2);
			
			//print to hidden field and markup on the form
			jQuery('[name="hidden_words_per_minute"]').val(wpm);			
			//jQuery('#wpm').html(wpm);
		}
		iLastTime = iTime;
		
	});	
	this.blur(function()
	{
		jQuery(this).keypress();
	});
	this.focus(function()
	{
		jQuery(this).keypress();
	});
};*/

/*
function resumeTimer() {
	var date = new Date();
	var t = date.toLocaleTimeString();
	jQuery("#edit-fieldset").data("starttime", t);
	var mystarttime = jQuery("#edit-fieldset").data("starttime");
	
	if(jQuery("#edit-fieldset").data("timer") === undefined) {
		jQuery("#edit-fieldset").data("start_time", jQuery.now());
		jQuery("#edit-fieldset").data("timer", jQuery.now());
		jQuery('[name="hidden_time_start"]').val(jQuery.now());
	} else {
		jQuery("#edit-fieldset").data("timer", jQuery.now());	
	}
	var start_time= jQuery("#edit-fieldset").data("start_time");
	jQuery('#starttime').html(start_time);
};

function pauseTimer(){
	var date2 = new Date();
	var t2 = date2.toLocaleTimeString();
	var start_of_interval = jQuery("#edit-fieldset").data("timer");

	//if this is the first time they're clicking out of the box
	if(jQuery("#edit-fieldset").data("total_time") === undefined) {
		jQuery("#edit-fieldset").data("total_time", jQuery.now() - start_of_interval);
		var total_time = jQuery("#edit-fieldset").data("total_time");
		jQuery('[name="hidden_total_time"]').val(total_time);
	} else {
		//cummulative time calculation in msec, will convert to sec when updating the form.
		var total_time = jQuery("#edit-fieldset").data("total_time") + jQuery.now() - start_of_interval;
		jQuery("#edit-fieldset").data("total_time", total_time);
	}
	jQuery('#currenttime').html(start_of_interval);
	jQuery('#totaltime').html(total_time/1000);
	//write to form
	jQuery('[name="hidden_time_writing"]').val(total_time/1000);
};
*/