/* File: hide_textarea.css
 * Version: 7103
 * Created: 2/16/2015
 * Description:
 *	  This will 'turn on' the form by unhiding elements from
 *	  users who have javascript turned off.	*/
 

jQuery(document).ready(function($) {
	//scorecard
	$("#edit-fieldset").css("display", "block");
	//title of journal
	$(".form-item.form-type-textfield.form-item-title").css("display", "block");
	//journal entry
	$("#edit-body").css("display", "block");
});