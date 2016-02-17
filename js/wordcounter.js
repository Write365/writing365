/* File: wordcounter.js
 * Version: 7103
 * - commented out jQuery.fn.wordCount since it was not being used.
 *
 *
 * Version: 7102
 * Updated: 1/30/2015
 * Changes:
 * - allows users to copy but not paste or cut
 * - updated word counting algorithm to use the phpjs str_word_count, which should match PHP's
 *   str_word_count function called in the module. PHP's str_word_count is only used if javascript
 *   is disabled or if the javascript is not writing to the correct elements.
 * - new functions for new algorithm: str_word_count, ctype_alpha, setlocale, & getenv.
 * - changed 'hiddenwordcoutnfield' to 'hidden_wordcount' to match changes in module file
 * - changed jQuery(document).ready(function) to Drupal.behaviors
 *	  ~ this allows us to pass variables from Drupal to the Javascript.
 *	  ~ modified other functions to fit this model
 *	  ~ removed 'this' from lines 105 and 149 because changing the functions caused 'this' to not work. I
 *		haven't discovered any problems arising from this.
 *	  ~ commented out old functions that we can switch back to if Drupal.behaviors doesn't work properly
 *	  x cannot figire out how to put the jQuery.fn.wordCount function into Drupal behaviors
 */
 
//same as $(document).ready(function())
(function ($) {
	Drupal.behaviors.writing365Wordcounter = {
		//write functions in here like this... call by Drupal.behaviors.writing365WordsPerMinute.function()
		wordcounter: function() {
			var total_words;
			var journal_area = $('#edit-body-und-0-value');
			//For each keypress function on text areas
			journal_area.keypress(function () { 
				var count = Drupal.behaviors.writing365Wordcounter.str_word_count(journal_area.val());	//this is where the magic happens 
				total_words = count.toString();	//Converting count into string. A number. 
				//write to hidden field and DOM
				$('[name="hidden_wordcount"]').val(total_words);
				//jQuery('#wordcount').html(total_words);
				$('#wordcount').html(total_words);
			});	
					
			journal_area.blur(function() {
				$(this).keypress();
			});
			journal_area.focus(function() {
				$(this).keypress();
			});
		},
		
		str_word_count: function(str, format, charlist) {
			var len = str.length,
			cl = charlist && charlist.length,
			chr = '',
			tmpStr = '',
			i = 0,
			c = '',
			wArr = [],
			wC = 0,
			assoc = {},
			aC = 0,
			reg = '',
			match = false;
			
			// BEGIN STATIC
			var _preg_quote = function (str) {
				return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '\\$1');
			};

			_getWholeChar = function (str, i) {
				// Use for rare cases of non-BMP characters
				var code = str.charCodeAt(i);
				if (code < 0xD800 || code > 0xDFFF) {
					return str.charAt(i);
				}
				if (0xD800 <= code && code <= 0xDBFF) {
					// High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
					if (str.length <= (i + 1)) {
						throw 'High surrogate without following low surrogate';
					}
					var next = str.charCodeAt(i + 1);
					if (0xDC00 > next || next > 0xDFFF) {
						throw 'High surrogate without following low surrogate';
					}
					return str.charAt(i) + str.charAt(i + 1);
				}
				// Low surrogate (0xDC00 <= code && code <= 0xDFFF)
				if (i === 0) {
				  throw 'Low surrogate without preceding high surrogate';
				}
				var prev = str.charCodeAt(i - 1);
				if (0xD800 > prev || prev > 0xDBFF) {
					// (could change last hex to 0xDB7F to treat high private surrogates as single characters)
					throw 'Low surrogate without preceding high surrogate';
				}
				// We can pass over low surrogates now as the second component in a pair which we have already processed
				return false;
			};
			// END STATIC
			if (cl) {
				reg = '^(' + _preg_quote(_getWholeChar(charlist, 0));
				for (i = 1; i < cl; i++) {
					if ((chr = _getWholeChar(charlist, i)) === false) {
						continue;
					}
					reg += '|' + _preg_quote(chr);
				}
				reg += ')$';
				reg = new RegExp(reg);
			}
			for (i = 0; i < len; i++) {
				if ((c = _getWholeChar(str, i)) === false) {
					continue;
				}
				//match = this.ctype_alpha(c)...Chris: started working when I took 'this' away...
				match = Drupal.behaviors.writing365Wordcounter.ctype_alpha(c) || (reg && c.search(reg) !== -1) || ((i !== 0 && i !== len - 1) && c === '-') || // No hyphen at beginning or end unless allowed in charlist (or locale)
					// No apostrophe at beginning unless allowed in charlist (or locale)
					(i !== 0 && c === "'");
				if (match) {
					if (tmpStr === '' && format === 2) {
						aC = i;
					}
					tmpStr = tmpStr + c;
				}
				if (i === len - 1 || !match && tmpStr !== '') {
					if (format !== 2) {
						wArr[wArr.length] = tmpStr;
					} else {
						assoc[aC] = tmpStr;
					}
					tmpStr = '';
					wC++;
				}
			}
			if (!format) {
				return wC;	
			} else if (format === 1) {
				return wArr;
			} else if (format === 2) {
				return assoc;
			}
			throw 'You have supplied an incorrect format';
		},
		
		ctype_alpha: function (text) {
			if (typeof text !== 'string') {
				return false;
			}
			// BEGIN REDUNDANT
			Drupal.behaviors.writing365Wordcounter.setlocale('LC_ALL', 0); // ensure setup of localization variables takes place
			// END REDUNDANT
			return text.search(this.php_js.locales[this.php_js.localeCategories.LC_CTYPE].LC_CTYPE.al) !== -1;
		},
		
		setlocale: function(category, locale) {
			var categ = '',
				cats = [],
				i = 0,
				d = window.document; //Chris: changed from this.window.document, which appears to be the same thing and was causing problems
		
			// BEGIN STATIC
			var _copy = function _copy(orig) {
				if (orig instanceof RegExp) {
					return new RegExp(orig);
				} else if (orig instanceof Date) {
					return new Date(orig);
				}
				var newObj = {};
				for (var i in orig) {
					if (typeof orig[i] === 'object') {
						newObj[i] = _copy(orig[i]);
					} else {
						newObj[i] = orig[i];
					}
				}
				return newObj;
			};
		
			// Function usable by a ngettext implementation (apparently not an accessible part of setlocale(), but locale-specific)
			// See http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms though amended with others from
			// https://developer.mozilla.org/En/Localization_and_Plurals (new categories noted with "MDC" below, though
			// not sure of whether there is a convention for the relative order of these newer groups as far as ngettext)
			// The function name indicates the number of plural forms (nplural)
			// Need to look into http://cldr.unicode.org/ (maybe future JavaScript); Dojo has some functions (under new BSD),
			// including JSON conversions of LDML XML from CLDR: http://bugs.dojotoolkit.org/browser/dojo/trunk/cldr
			// and docs at http://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr
			var _nplurals1 = function(n) { // e.g., Japanese
				return 0;
			};
			var _nplurals2a = function(n) { // e.g., English
				return n !== 1 ? 1 : 0;
			};
			var _nplurals2b = function(n) { // e.g., French
				return n > 1 ? 1 : 0;
			};
			var _nplurals2c = function(n) { // e.g., Icelandic (MDC)
				return n % 10 === 1 && n % 100 !== 11 ? 0 : 1;
			};
			var _nplurals3a = function(n) { // e.g., Latvian (MDC has a different order from gettext)
				return n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2;
			};
			var _nplurals3b = function(n) { // e.g., Scottish Gaelic
				return n === 1 ? 0 : n === 2 ? 1 : 2;
			};
			var _nplurals3c = function(n) { // e.g., Romanian
				return n === 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2;
			};
			var _nplurals3d = function(n) { // e.g., Lithuanian (MDC has a different order from gettext)
				return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
			};
			var _nplurals3e = function(n) { // e.g., Croatian
				return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 :
					2;
			};
			var _nplurals3f = function(n) { // e.g., Slovak
				return n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
			};
			var _nplurals3g = function(n) { // e.g., Polish
				return n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
			};
			var _nplurals3h = function(n) { // e.g., Macedonian (MDC)
				return n % 10 === 1 ? 0 : n % 10 === 2 ? 1 : 2;
			};
			var _nplurals4a = function(n) { // e.g., Slovenian
				return n % 100 === 1 ? 0 : n % 100 === 2 ? 1 : n % 100 === 3 || n % 100 === 4 ? 2 : 3;
			};
			var _nplurals4b = function(n) { // e.g., Maltese (MDC)
				return n === 1 ? 0 : n === 0 || (n % 100 && n % 100 <= 10) ? 1 : n % 100 >= 11 && n % 100 <= 19 ? 2 : 3;
			};
			var _nplurals5 = function(n) { // e.g., Irish Gaeilge (MDC)
				return n === 1 ? 0 : n === 2 ? 1 : n >= 3 && n <= 6 ? 2 : n >= 7 && n <= 10 ? 3 : 4;
			};
			var _nplurals6 = function(n) { // e.g., Arabic (MDC) - Per MDC puts 0 as last group
				return n === 0 ? 5 : n === 1 ? 0 : n === 2 ? 1 : n % 100 >= 3 && n % 100 <= 10 ? 2 : n % 100 >= 11 && n % 100 <=
					99 ? 3 : 4;
			};
			// END STATIC
			// BEGIN REDUNDANT
			try {
				this.php_js = this.php_js || {};
			} catch (e) {
				this.php_js = {};
			}
		
			var phpjs = this.php_js;
		
			// Reconcile Windows vs. *nix locale names?
			// Allow different priority orders of languages, esp. if implement gettext as in
			//		LANGUAGE env. var.? (e.g., show German if French is not available)
			if (!phpjs.locales) {
				// Can add to the locales
				phpjs.locales = {};
		
				phpjs.locales.en = {
					'LC_COLLATE': // For strcoll
		
					function(str1, str2) { // Fix: This one taken from strcmp, but need for other locales; we don't use localeCompare since its locale is not settable
						return (str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1);
					},
					'LC_CTYPE': { // Need to change any of these for English as opposed to C?
						an: /^[A-Za-z\d]+$/g,
						al: /^[A-Za-z]+$/g,
						ct: /^[\u0000-\u001F\u007F]+$/g,
						dg: /^[\d]+$/g,
						gr: /^[\u0021-\u007E]+$/g,
						lw: /^[a-z]+$/g,
						pr: /^[\u0020-\u007E]+$/g,
						pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
						sp: /^[\f\n\r\t\v ]+$/g,
						up: /^[A-Z]+$/g,
						xd: /^[A-Fa-f\d]+$/g,
						CODESET: 'UTF-8',
						// Used by sql_regcase
						lower: 'abcdefghijklmnopqrstuvwxyz',
						upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
					},
					'LC_TIME': { // Comments include nl_langinfo() constant equivalents and any changes from Blues' implementation
						a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
						// ABDAY_
						A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
						// DAY_
						b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
						// ABMON_
						B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
							'November', 'December'
						],
						// MON_
						c: '%a %d %b %Y %r %Z',
						// D_T_FMT // changed %T to %r per results
						p: ['AM', 'PM'],
						// AM_STR/PM_STR
						P: ['am', 'pm'],
						// Not available in nl_langinfo()
						r: '%I:%M:%S %p',
						// T_FMT_AMPM (Fixed for all locales)
						x: '%m/%d/%Y',
						// D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
						X: '%r',
						// T_FMT // changed from %T to %r	(%T is default for C, not English US)
						// Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
						alt_digits: '',
						// e.g., ordinal
						ERA: '',
						ERA_YEAR: '',
						ERA_D_T_FMT: '',
						ERA_D_FMT: '',
						ERA_T_FMT: ''
					},
					// Assuming distinction between numeric and monetary is thus:
					// See below for C locale
					'LC_MONETARY': { // original by Windows "english" (English_United States.1252) locale
						int_curr_symbol: 'USD',
						currency_symbol: '$',
						mon_decimal_point: '.',
						mon_thousands_sep: ',',
						mon_grouping: [3],
						// use mon_thousands_sep; "" for no grouping; additional array members indicate successive group lengths after first group (e.g., if to be 1,23,456, could be [3, 2])
						positive_sign: '',
						negative_sign: '-',
						int_frac_digits: 2,
						// Fractional digits only for money defaults?
						frac_digits: 2,
						p_cs_precedes: 1,
						// positive currency symbol follows value = 0; precedes value = 1
						p_sep_by_space: 0,
						// 0: no space between curr. symbol and value; 1: space sep. them unless symb. and sign are adjacent then space sep. them from value; 2: space sep. sign and value unless symb. and sign are adjacent then space separates
						n_cs_precedes: 1,
						// see p_cs_precedes
						n_sep_by_space: 0,
						// see p_sep_by_space
						p_sign_posn: 3,
						// 0: parentheses surround quantity and curr. symbol; 1: sign precedes them; 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed. succeeds curr. symbol
						n_sign_posn: 0 // see p_sign_posn
					},
					'LC_NUMERIC': { // original by Windows "english" (English_United States.1252) locale
						decimal_point: '.',
						thousands_sep: ',',
						grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
					},
					'LC_MESSAGES': {
						YESEXPR: '^[yY].*',
						NOEXPR: '^[nN].*',
						YESSTR: '',
						NOSTR: ''
					},
					nplurals: _nplurals2a
				};
				phpjs.locales.en_US = _copy(phpjs.locales.en);
				phpjs.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z';
				phpjs.locales.en_US.LC_TIME.x = '%D';
				phpjs.locales.en_US.LC_TIME.X = '%r';
				// The following are original by *nix settings
				phpjs.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD ';
				phpjs.locales.en_US.LC_MONETARY.p_sign_posn = 1;
				phpjs.locales.en_US.LC_MONETARY.n_sign_posn = 1;
				phpjs.locales.en_US.LC_MONETARY.mon_grouping = [3, 3];
				phpjs.locales.en_US.LC_NUMERIC.thousands_sep = '';
				phpjs.locales.en_US.LC_NUMERIC.grouping = [];
		
				phpjs.locales.en_GB = _copy(phpjs.locales.en);
				phpjs.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z';
		
				phpjs.locales.en_AU = _copy(phpjs.locales.en_GB);
				phpjs.locales.C = _copy(phpjs.locales.en); // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
				phpjs.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968';
				phpjs.locales.C.LC_MONETARY = {
					int_curr_symbol: '',
					currency_symbol: '',
					mon_decimal_point: '',
					mon_thousands_sep: '',
					mon_grouping: [],
					p_cs_precedes: 127,
					p_sep_by_space: 127,
					n_cs_precedes: 127,
					n_sep_by_space: 127,
					p_sign_posn: 127,
					n_sign_posn: 127,
					positive_sign: '',
					negative_sign: '',
					int_frac_digits: 127,
					frac_digits: 127
				};
				phpjs.locales.C.LC_NUMERIC = {
					decimal_point: '.',
					thousands_sep: '',
					grouping: []
				};
				phpjs.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y'; // D_T_FMT
				phpjs.locales.C.LC_TIME.x = '%m/%d/%y'; // D_FMT
				phpjs.locales.C.LC_TIME.X = '%H:%M:%S'; // T_FMT
				phpjs.locales.C.LC_MESSAGES.YESEXPR = '^[yY]';
				phpjs.locales.C.LC_MESSAGES.NOEXPR = '^[nN]';
		
				phpjs.locales.fr = _copy(phpjs.locales.en);
				phpjs.locales.fr.nplurals = _nplurals2b;
				phpjs.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
				phpjs.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
				phpjs.locales.fr.LC_TIME.b = ['jan', 'f\u00E9v', 'mar', 'avr', 'mai', 'jun', 'jui', 'ao\u00FB', 'sep', 'oct',
					'nov', 'd\u00E9c'
				];
				phpjs.locales.fr.LC_TIME.B = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt',
					'septembre', 'octobre', 'novembre', 'd\u00E9cembre'
				];
				phpjs.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z';
				phpjs.locales.fr.LC_TIME.p = ['', ''];
				phpjs.locales.fr.LC_TIME.P = ['', ''];
				phpjs.locales.fr.LC_TIME.x = '%d.%m.%Y';
				phpjs.locales.fr.LC_TIME.X = '%T';
		
				phpjs.locales.fr_CA = _copy(phpjs.locales.fr);
				phpjs.locales.fr_CA.LC_TIME.x = '%Y-%m-%d';
			}
			if (!phpjs.locale) {
				phpjs.locale = 'en_US';
				var NS_XHTML = 'http://www.w3.org/1999/xhtml';
				var NS_XML = 'http://www.w3.org/XML/1998/namespace';
				if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
					if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d.getElementsByTagNameNS(NS_XHTML,
						'html')[0].getAttributeNS(NS_XML, 'lang')) {
						phpjs.locale = d.getElementsByTagName(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang');
					} else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) { // XHTML 1.0 only
						phpjs.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang;
					}
				} else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0].lang) {
					phpjs.locale = d.getElementsByTagName('html')[0].lang;
				}
			}
			phpjs.locale = phpjs.locale.replace('-', '_'); // PHP-style
			// Fix locale if declared locale hasn't been defined
			if (!(phpjs.locale in phpjs.locales)) {
				if (phpjs.locale.replace(/_[a-zA-Z]+$/, '') in phpjs.locales) {
					phpjs.locale = phpjs.locale.replace(/_[a-zA-Z]+$/, '');
				}
			}
		
			if (!phpjs.localeCategories) {
				phpjs.localeCategories = {
					'LC_COLLATE': phpjs.locale,
					// for string comparison, see strcoll()
					'LC_CTYPE': phpjs.locale,
					// for character classification and conversion, for example strtoupper()
					'LC_MONETARY': phpjs.locale,
					// for localeconv()
					'LC_NUMERIC': phpjs.locale,
					// for decimal separator (See also localeconv())
					'LC_TIME': phpjs.locale,
					// for date and time formatting with strftime()
					'LC_MESSAGES': phpjs.locale // for system responses (available if PHP was compiled with libintl)
				};
			}
			// END REDUNDANT
			if (locale === null || locale === '') {
				locale = this.Drupal.behaviors.writing365Wordcounter.getenv(category) || this.Drupal.behaviors.writing365Wordcounter.getenv('LANG');
			} else if (Object.prototype.toString.call(locale) === '[object Array]') {
				for (i = 0; i < locale.length; i++) {
					if (!(locale[i] in this.php_js.locales)) {
						if (i === locale.length - 1) {
							return false; // none found
						}
						continue;
					}
					locale = locale[i];
					break;
				}
			}		
			// Just get the locale
			if (locale === '0' || locale === 0) {
				if (category === 'LC_ALL') {
					for (categ in this.php_js.localeCategories) {
						cats.push(categ + '=' + this.php_js.localeCategories[categ]); // Add ".UTF-8" or allow ".@latint", etc. to the end?
					}
					return cats.join(';');
				}
				return this.php_js.localeCategories[category];
			}
			if (!(locale in this.php_js.locales)) {
				return false; // Locale not found
			}
			// Set and get locale
			if (category === 'LC_ALL') {
				for (categ in this.php_js.localeCategories) {
					this.php_js.localeCategories[categ] = locale;
				}
			} else {
				this.php_js.localeCategories[category] = locale;
			}
			return locale;
		},

		getenv: function(varname) {

			if (!this.php_js || !this.php_js.ENV || !this.php_js.ENV[varname]) {
				return false;
			}
			
			return this.php_js.ENV[varname];
		},	
		
		attach: function(context, settings) {
			//prevent cut and paste (its fine if they copy though), added 'drop' 3/31/15 mpd
			$('#edit-body-und-0-value').bind('paste cut drop', function (e) {
				e.preventDefault();
			});
			//tie function to the body
			Drupal.behaviors.writing365Wordcounter.wordcounter();
			//$('#edit-body-und-0-value').wordCount({counterElement:"wordcount"});
		}
	};
})(jQuery);




/* OLD CODE
jQuery(document).ready(function() {
	//prevent cut and paste
	jQuery('#edit-body-und-0-value').bind('paste cut', function (e) {
        e.preventDefault();
	});
	//tie function to the body
	jQuery('#edit-body-und-0-value').wordCount({counterElement:"wordcount"});
});*/


/*
jQuery.fn.wordCount = function(params){
	var p = {
		counterElement:"display_count"
	};
	var total_words;
	
	if(params) {
		jQuery.extend(p, params);
	}
	
	//For each keypress function on text areas
	this.keypress(function()
	{ 

		var count = Drupal.behaviors.writing365Wordcounter.str_word_count(this.value);	//this is where the magic happens 
		total_words = count.toString();					//Converting count into string. A number. 
		//write to hidden field and DOM
		jQuery('[name="hidden_wordcount"]').val(total_words);
		//jQuery('#wordcount').html(total_words);
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
};*/

/*
function str_word_count(str, format, charlist) {

  var len = str.length,
    cl = charlist && charlist.length,
    chr = '',
    tmpStr = '',
    i = 0,
    c = '',
    wArr = [],
    wC = 0,
    assoc = {},
    aC = 0,
    reg = '',
    match = false;

  // BEGIN STATIC
  var _preg_quote = function (str) {
    return (str + '')
      .replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '\\$1');
  };
  _getWholeChar = function (str, i) {
    // Use for rare cases of non-BMP characters
    var code = str.charCodeAt(i);
    if (code < 0xD800 || code > 0xDFFF) {
      return str.charAt(i);
    }
    if (0xD800 <= code && code <= 0xDBFF) {
      // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
      if (str.length <= (i + 1)) {
        throw 'High surrogate without following low surrogate';
      }
      var next = str.charCodeAt(i + 1);
      if (0xDC00 > next || next > 0xDFFF) {
        throw 'High surrogate without following low surrogate';
      }
      return str.charAt(i) + str.charAt(i + 1);
    }
    // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
    if (i === 0) {
      throw 'Low surrogate without preceding high surrogate';
    }
    var prev = str.charCodeAt(i - 1);
    if (0xD800 > prev || prev > 0xDBFF) {
      // (could change last hex to 0xDB7F to treat high private surrogates as single characters)
      throw 'Low surrogate without preceding high surrogate';
    }
    // We can pass over low surrogates now as the second component in a pair which we have already processed
    return false;
  };
  // END STATIC
  if (cl) {
    reg = '^(' + _preg_quote(_getWholeChar(charlist, 0));
    for (i = 1; i < cl; i++) {
      if ((chr = _getWholeChar(charlist, i)) === false) {
        continue;
      }
      reg += '|' + _preg_quote(chr);
    }
    reg += ')$';
    reg = new RegExp(reg);
  }

  for (i = 0; i < len; i++) {
    if ((c = _getWholeChar(str, i)) === false) {
      continue;
    }
    match = this.ctype_alpha(c) || (reg && c.search(reg) !== -1) || ((i !== 0 && i !== len - 1) && c === '-') || // No hyphen at beginning or end unless allowed in charlist (or locale)
    // No apostrophe at beginning unless allowed in charlist (or locale)
    (i !== 0 && c === "'");
    if (match) {
      if (tmpStr === '' && format === 2) {
        aC = i;
      }
      tmpStr = tmpStr + c;
    }
    if (i === len - 1 || !match && tmpStr !== '') {
      if (format !== 2) {
        wArr[wArr.length] = tmpStr;
      } else {
        assoc[aC] = tmpStr;
      }
      tmpStr = '';
      wC++;
    }
  }

  if (!format) {
    return wC;	
  } else if (format === 1) {
    return wArr;
  } else if (format === 2) {
    return assoc;
  }

  throw 'You have supplied an incorrect format';
}*/

/*
function ctype_alpha(text) {
  //  discuss at: http://phpjs.org/functions/ctype_alpha/
  // original by: Brett Zamir (http://brett-zamir.me)
  //  depends on: setlocale
  //   example 1: ctype_alpha('Az');
  //   returns 1: true

  if (typeof text !== 'string') {
    return false;
  }
  // BEGIN REDUNDANT
  this.setlocale('LC_ALL', 0); // ensure setup of localization variables takes place
  // END REDUNDANT
  return text.search(this.php_js.locales[this.php_js.localeCategories.LC_CTYPE].LC_CTYPE.al) !== -1;
}*/

/*
function setlocale(category, locale) {

  var categ = '',
    cats = [],
    i = 0,
    d = this.window.document;

  // BEGIN STATIC
  var _copy = function _copy(orig) {
    if (orig instanceof RegExp) {
      return new RegExp(orig);
    } else if (orig instanceof Date) {
      return new Date(orig);
    }
    var newObj = {};
    for (var i in orig) {
      if (typeof orig[i] === 'object') {
        newObj[i] = _copy(orig[i]);
      } else {
        newObj[i] = orig[i];
      }
    }
    return newObj;
  };

  // Function usable by a ngettext implementation (apparently not an accessible part of setlocale(), but locale-specific)
  // See http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms though amended with others from
  // https://developer.mozilla.org/En/Localization_and_Plurals (new categories noted with "MDC" below, though
  // not sure of whether there is a convention for the relative order of these newer groups as far as ngettext)
  // The function name indicates the number of plural forms (nplural)
  // Need to look into http://cldr.unicode.org/ (maybe future JavaScript); Dojo has some functions (under new BSD),
  // including JSON conversions of LDML XML from CLDR: http://bugs.dojotoolkit.org/browser/dojo/trunk/cldr
  // and docs at http://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr
  var _nplurals1 = function(n) { // e.g., Japanese
    return 0;
  };
  var _nplurals2a = function(n) { // e.g., English
    return n !== 1 ? 1 : 0;
  };
  var _nplurals2b = function(n) { // e.g., French
    return n > 1 ? 1 : 0;
  };
  var _nplurals2c = function(n) { // e.g., Icelandic (MDC)
    return n % 10 === 1 && n % 100 !== 11 ? 0 : 1;
  };
  var _nplurals3a = function(n) { // e.g., Latvian (MDC has a different order from gettext)
    return n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2;
  };
  var _nplurals3b = function(n) { // e.g., Scottish Gaelic
    return n === 1 ? 0 : n === 2 ? 1 : 2;
  };
  var _nplurals3c = function(n) { // e.g., Romanian
    return n === 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2;
  };
  var _nplurals3d = function(n) { // e.g., Lithuanian (MDC has a different order from gettext)
    return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  };
  var _nplurals3e = function(n) { // e.g., Croatian
    return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 :
      2;
  };
  var _nplurals3f = function(n) { // e.g., Slovak
    return n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
  };
  var _nplurals3g = function(n) { // e.g., Polish
    return n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  };
  var _nplurals3h = function(n) { // e.g., Macedonian (MDC)
    return n % 10 === 1 ? 0 : n % 10 === 2 ? 1 : 2;
  };
  var _nplurals4a = function(n) { // e.g., Slovenian
    return n % 100 === 1 ? 0 : n % 100 === 2 ? 1 : n % 100 === 3 || n % 100 === 4 ? 2 : 3;
  };
  var _nplurals4b = function(n) { // e.g., Maltese (MDC)
    return n === 1 ? 0 : n === 0 || (n % 100 && n % 100 <= 10) ? 1 : n % 100 >= 11 && n % 100 <= 19 ? 2 : 3;
  };
  var _nplurals5 = function(n) { // e.g., Irish Gaeilge (MDC)
    return n === 1 ? 0 : n === 2 ? 1 : n >= 3 && n <= 6 ? 2 : n >= 7 && n <= 10 ? 3 : 4;
  };
  var _nplurals6 = function(n) { // e.g., Arabic (MDC) - Per MDC puts 0 as last group
    return n === 0 ? 5 : n === 1 ? 0 : n === 2 ? 1 : n % 100 >= 3 && n % 100 <= 10 ? 2 : n % 100 >= 11 && n % 100 <=
      99 ? 3 : 4;
  };
  // END STATIC
  // BEGIN REDUNDANT
  try {
    this.php_js = this.php_js || {};
  } catch (e) {
    this.php_js = {};
  }

  var phpjs = this.php_js;

  // Reconcile Windows vs. *nix locale names?
  // Allow different priority orders of languages, esp. if implement gettext as in
  //     LANGUAGE env. var.? (e.g., show German if French is not available)
  if (!phpjs.locales) {
    // Can add to the locales
    phpjs.locales = {};

    phpjs.locales.en = {
      'LC_COLLATE': // For strcoll

      function(str1, str2) { // Fix: This one taken from strcmp, but need for other locales; we don't use localeCompare since its locale is not settable
        return (str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1);
      },
      'LC_CTYPE': { // Need to change any of these for English as opposed to C?
        an: /^[A-Za-z\d]+$/g,
        al: /^[A-Za-z]+$/g,
        ct: /^[\u0000-\u001F\u007F]+$/g,
        dg: /^[\d]+$/g,
        gr: /^[\u0021-\u007E]+$/g,
        lw: /^[a-z]+$/g,
        pr: /^[\u0020-\u007E]+$/g,
        pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
        sp: /^[\f\n\r\t\v ]+$/g,
        up: /^[A-Z]+$/g,
        xd: /^[A-Fa-f\d]+$/g,
        CODESET: 'UTF-8',
        // Used by sql_regcase
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      },
      'LC_TIME': { // Comments include nl_langinfo() constant equivalents and any changes from Blues' implementation
        a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        // ABDAY_
        A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        // DAY_
        b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        // ABMON_
        B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
          'November', 'December'
        ],
        // MON_
        c: '%a %d %b %Y %r %Z',
        // D_T_FMT // changed %T to %r per results
        p: ['AM', 'PM'],
        // AM_STR/PM_STR
        P: ['am', 'pm'],
        // Not available in nl_langinfo()
        r: '%I:%M:%S %p',
        // T_FMT_AMPM (Fixed for all locales)
        x: '%m/%d/%Y',
        // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
        X: '%r',
        // T_FMT // changed from %T to %r  (%T is default for C, not English US)
        // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
        alt_digits: '',
        // e.g., ordinal
        ERA: '',
        ERA_YEAR: '',
        ERA_D_T_FMT: '',
        ERA_D_FMT: '',
        ERA_T_FMT: ''
      },
      // Assuming distinction between numeric and monetary is thus:
      // See below for C locale
      'LC_MONETARY': { // original by Windows "english" (English_United States.1252) locale
        int_curr_symbol: 'USD',
        currency_symbol: '$',
        mon_decimal_point: '.',
        mon_thousands_sep: ',',
        mon_grouping: [3],
        // use mon_thousands_sep; "" for no grouping; additional array members indicate successive group lengths after first group (e.g., if to be 1,23,456, could be [3, 2])
        positive_sign: '',
        negative_sign: '-',
        int_frac_digits: 2,
        // Fractional digits only for money defaults?
        frac_digits: 2,
        p_cs_precedes: 1,
        // positive currency symbol follows value = 0; precedes value = 1
        p_sep_by_space: 0,
        // 0: no space between curr. symbol and value; 1: space sep. them unless symb. and sign are adjacent then space sep. them from value; 2: space sep. sign and value unless symb. and sign are adjacent then space separates
        n_cs_precedes: 1,
        // see p_cs_precedes
        n_sep_by_space: 0,
        // see p_sep_by_space
        p_sign_posn: 3,
        // 0: parentheses surround quantity and curr. symbol; 1: sign precedes them; 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed. succeeds curr. symbol
        n_sign_posn: 0 // see p_sign_posn
      },
      'LC_NUMERIC': { // original by Windows "english" (English_United States.1252) locale
        decimal_point: '.',
        thousands_sep: ',',
        grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
      },
      'LC_MESSAGES': {
        YESEXPR: '^[yY].*',
        NOEXPR: '^[nN].*',
        YESSTR: '',
        NOSTR: ''
      },
      nplurals: _nplurals2a
    };
    phpjs.locales.en_US = _copy(phpjs.locales.en);
    phpjs.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z';
    phpjs.locales.en_US.LC_TIME.x = '%D';
    phpjs.locales.en_US.LC_TIME.X = '%r';
    // The following are original by *nix settings
    phpjs.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD ';
    phpjs.locales.en_US.LC_MONETARY.p_sign_posn = 1;
    phpjs.locales.en_US.LC_MONETARY.n_sign_posn = 1;
    phpjs.locales.en_US.LC_MONETARY.mon_grouping = [3, 3];
    phpjs.locales.en_US.LC_NUMERIC.thousands_sep = '';
    phpjs.locales.en_US.LC_NUMERIC.grouping = [];

    phpjs.locales.en_GB = _copy(phpjs.locales.en);
    phpjs.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z';

    phpjs.locales.en_AU = _copy(phpjs.locales.en_GB);
    phpjs.locales.C = _copy(phpjs.locales.en); // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
    phpjs.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968';
    phpjs.locales.C.LC_MONETARY = {
      int_curr_symbol: '',
      currency_symbol: '',
      mon_decimal_point: '',
      mon_thousands_sep: '',
      mon_grouping: [],
      p_cs_precedes: 127,
      p_sep_by_space: 127,
      n_cs_precedes: 127,
      n_sep_by_space: 127,
      p_sign_posn: 127,
      n_sign_posn: 127,
      positive_sign: '',
      negative_sign: '',
      int_frac_digits: 127,
      frac_digits: 127
    };
    phpjs.locales.C.LC_NUMERIC = {
      decimal_point: '.',
      thousands_sep: '',
      grouping: []
    };
    phpjs.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y'; // D_T_FMT
    phpjs.locales.C.LC_TIME.x = '%m/%d/%y'; // D_FMT
    phpjs.locales.C.LC_TIME.X = '%H:%M:%S'; // T_FMT
    phpjs.locales.C.LC_MESSAGES.YESEXPR = '^[yY]';
    phpjs.locales.C.LC_MESSAGES.NOEXPR = '^[nN]';

    phpjs.locales.fr = _copy(phpjs.locales.en);
    phpjs.locales.fr.nplurals = _nplurals2b;
    phpjs.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
    phpjs.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    phpjs.locales.fr.LC_TIME.b = ['jan', 'f\u00E9v', 'mar', 'avr', 'mai', 'jun', 'jui', 'ao\u00FB', 'sep', 'oct',
      'nov', 'd\u00E9c'
    ];
    phpjs.locales.fr.LC_TIME.B = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt',
      'septembre', 'octobre', 'novembre', 'd\u00E9cembre'
    ];
    phpjs.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z';
    phpjs.locales.fr.LC_TIME.p = ['', ''];
    phpjs.locales.fr.LC_TIME.P = ['', ''];
    phpjs.locales.fr.LC_TIME.x = '%d.%m.%Y';
    phpjs.locales.fr.LC_TIME.X = '%T';

    phpjs.locales.fr_CA = _copy(phpjs.locales.fr);
    phpjs.locales.fr_CA.LC_TIME.x = '%Y-%m-%d';
  }
  if (!phpjs.locale) {
    phpjs.locale = 'en_US';
    var NS_XHTML = 'http://www.w3.org/1999/xhtml';
    var NS_XML = 'http://www.w3.org/XML/1998/namespace';
    if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
      if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d.getElementsByTagNameNS(NS_XHTML,
        'html')[0].getAttributeNS(NS_XML, 'lang')) {
        phpjs.locale = d.getElementsByTagName(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang');
      } else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) { // XHTML 1.0 only
        phpjs.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang;
      }
    } else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0].lang) {
      phpjs.locale = d.getElementsByTagName('html')[0].lang;
    }
  }
  phpjs.locale = phpjs.locale.replace('-', '_'); // PHP-style
  // Fix locale if declared locale hasn't been defined
  if (!(phpjs.locale in phpjs.locales)) {
    if (phpjs.locale.replace(/_[a-zA-Z]+$/, '') in phpjs.locales) {
      phpjs.locale = phpjs.locale.replace(/_[a-zA-Z]+$/, '');
    }
  }

  if (!phpjs.localeCategories) {
    phpjs.localeCategories = {
      'LC_COLLATE': phpjs.locale,
      // for string comparison, see strcoll()
      'LC_CTYPE': phpjs.locale,
      // for character classification and conversion, for example strtoupper()
      'LC_MONETARY': phpjs.locale,
      // for localeconv()
      'LC_NUMERIC': phpjs.locale,
      // for decimal separator (See also localeconv())
      'LC_TIME': phpjs.locale,
      // for date and time formatting with strftime()
      'LC_MESSAGES': phpjs.locale // for system responses (available if PHP was compiled with libintl)
    };
  }
  // END REDUNDANT
  if (locale === null || locale === '') {
    locale = this.getenv(category) || this.getenv('LANG');
  } else if (Object.prototype.toString.call(locale) === '[object Array]') {
    for (i = 0; i < locale.length; i++) {
      if (!(locale[i] in this.php_js.locales)) {
        if (i === locale.length - 1) {
          return false; // none found
        }
        continue;
      }
      locale = locale[i];
      break;
    }
  }

  // Just get the locale
  if (locale === '0' || locale === 0) {
    if (category === 'LC_ALL') {
      for (categ in this.php_js.localeCategories) {
        cats.push(categ + '=' + this.php_js.localeCategories[categ]); // Add ".UTF-8" or allow ".@latint", etc. to the end?
      }
      return cats.join(';');
    }
    return this.php_js.localeCategories[category];
  }

  if (!(locale in this.php_js.locales)) {
    return false; // Locale not found
  }

  // Set and get locale
  if (category === 'LC_ALL') {
    for (categ in this.php_js.localeCategories) {
      this.php_js.localeCategories[categ] = locale;
    }
  } else {
    this.php_js.localeCategories[category] = locale;
  }
  return locale;
}*/

/*
function getenv(varname) {

  if (!this.php_js || !this.php_js.ENV || !this.php_js.ENV[varname]) {
    return false;
  }

  return this.php_js.ENV[varname];
}*/