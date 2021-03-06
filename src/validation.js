/*!
 * Validation Library
 *
 * Depends on jQuery (Tested on jQuery 1.8.2)
 *
 * Released under the MIT license
 *
 * Author: Ashit Vora (ashit.vora@alfanso.com)
 *          
 * Credits: 
 *	1. Nicholas Ruunu (https://github.com/nicholasruunu)
 *	2. Rizwan Qureshi
 */
(function($, undefined){
	window.Validation = {};
	
	/**
	 * Errors
	 * 
	 * Array containing array of errors.
	 * Each error has 
	 * - Error Message
	 * - Field on which error occured
	 */
	var errors = {};


	/**
	 * Generate error message
	 */
	var generate_error_message = function(field, message, params){

		message = message.replace( "{name}", $(field).attr("name") )
						 .replace( "{val}", $(field).val() );

		$.each(params, function(i, param){
			message = message.replace("{param"+ (i+1) +"}", param);
		});

		return message;
	};
	
	
	/**
	 * List of all the Validations with
	 * - Rule
	 * - Error Message
	 */
	var validations = {
		required: {
			rule: function(f){
				return $(f).val().match(/[\S]+/);
			},
			message: "{name} can not be blank"
		},
		alpha: {
			rule: function(f){
				return $(f).val().match(/^[a-zA-z\s]+$/);
			},
			message: "{name} should contain letters and spaces only"
		},
		numeric: {
			rule: function(f){
				return $(f).val().match(/^[-]?\d+(\.\d+)?$/);
			},
			message: "{name} should contain numbers only"
		},
		digit: {
			rule: function(f){
				return $(f).val().match(/^\d+$/);
			},
			message: "{name} should contain digits only"
		},
		alphanumeric: {
			rule: function(f){
				return $(f).val().match(/^[a-zA-Z0-9]+$/);
			},
			message: "{name} should contain letters and numbers only"
		},
		email: {
			rule: function(f){
				return $(f).val().match(/^([a-zA-Z0-9_\.\-])+(\+[a-zA-Z0-9]+)*\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/);
			},
			message: "{val} is not a valid email address"
		},
		uszip: {
			rule: function(f){
				return $(f).val().match(/^(\d{5}\-?(\d{4})? )$/);
			},
			message: "{val} is not a valid US zipcode"
		},
		usphone: {
			rule: function(f){
				return $(f).val().match(/^([0-9]( |-|.)?)?(\(?[0-9]{3}\)?|[0-9]{3})( |-|.)?([0-9]{3}( |-|.)?[0-9]{4}|[a-zA-Z0-9]{7})$/);
			},
			message: "{val} is not a valid US phone number"
		},
		creditcard: {
			rule: function(f){
				return $(f).val().match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/);
			},
			message: "{val} is not a valid credit card number"
		},
		ssn: {
			rule: function(f){
				return $(f).val().match(/^((?!000)(?!666)([0-6]\d{2}|7[0-2][0-9]|73[0-3]|7[5-6][0-9]|77[0-1]))(\s|\-)((?!00)\d{2})(\s|\-)((?!0000)\d{4})$/);
			},
			message: "{val} is not a valid social security number"
		},
		alpha_dash: {
			rule: function(f){
				return $(f).val().match(/^([-a-z0-9_-])+$/);
			},
			message: "{name} must contain only letters, numbers, dashes or underscore characters."
		},
		size: {
			rule: function(f, params){
				return $(f).val().length == params[0];
			},
			message: "{name} must be exactly {param1} characters long."
		},
		between: {
			rule: function(f, params){
				value = $(f).val();

				if( isNaN(value) ){
					return value.length > params[0] && value.length < params[1];
				}
				else{
					return value > params[0] && value < params[1];
				}
			},
			message: "{name} must be between {param1} and {param2}."
		},
		min: {
			rule: function(f, params){
				value = $(f).val();

				if( isNaN(value) ){
					return value.length >= parseInt(params[0], 10);
				}
				else{
					return parseInt(value, 10) >= parseInt(params[0], 10);
				}
			},
			message: "{name} must be minimum {param1}."
		},
		max: {
			rule: function(f, params){
				value = $(f).val();

				if( isNaN(value) ){
					return value.length <= parseInt(params[0], 10);
				}
				else{
					return parseInt(value, 10) <= parseInt(params[0], 10);
				}
			},
			message: "{name} should not be more than {param1}."
		},
		url: {
			rule: function(f){
				return $(f).val().match(/^\b(https?|ftp|file):\/\/[-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[-A-Za-z0-9+&@#\/%=~_|]/);
			},
			message: "{val} is not a valid URL"
		},
		ipaddress: {
			rule: function(f){
				return $(f).val().match(/^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/);
			},
			message: "{val} is not a valid IP address"
		},
		image: {
			rule: function(f){
				return $(f).val().match(/(.*?)\.(jpg|jpeg|png|gif|bmp)$/i);
			},
			message: "{val} is not an image."
		}

	};
	
	
	/**
	 * Register new Validation
	 * 
	 * -----------------------------------------
	 * 	Validation.register("jk", function(f){
	 * 		return false;
	 * 	}, "{name} is just kidding with {val}");
	 * -----------------------------------------
	 */
	Validation.register = function(name, rule, message){
		validations[name] = {
			rule: rule,
			message: message
		};
	};


	/**
	 * Update message method
	 *
	 * Update the error message of an existing rule
	 */
	Validation.update_message = function(name, message){
		if( validations.hasOwnProperty(name) ){
			validations[name].message = message;
		}
	};


	/**
	 * Validate method
	 * 
	 * loop thru all the fields that have data-validate attribute
	 */
	Validation.run = function(form){
		// empty errors object
		errors = {};
		
		form.find("[data-validate]").each(function(i, field){
			
			var validations_to_test = $(field).data("validate").split("|");
			
			$.each(validations_to_test, function(j, v){
				// required, email, size[5], between[1,10]
				v_params = $.trim(v).toLowerCase().split("[");

				v = v_params[0];

				if(v_params.length > 1){
					params = v_params[1].replace("]", "").split(",");
				}
				else{
					params = [];
				}
				
				if(validations.hasOwnProperty (v) ){
					if(! validations[v].rule(field, params) ){
						
						var field_name = $(field).attr("name");
						
						// If this is the first error message for this field,
						// add the field name as the key and set it's value as empty array
						if( ! errors.hasOwnProperty(field_name) ){
							errors[ field_name ] = [];
						}
						
						errors[ $(field).attr("name") ].push(
							generate_error_message( field, validations[v].message, params)
						);
					}
				}
			});			
			
		});
	};
	
	
	/**
	 * Return TRUE/FALSE whether Validation has passed or not
	 */
	Validation.passed = function(){
		return $.isEmptyObject(errors);
	};
	
	
	/**
	 * Return TRUE/FALSE whether Validation has failed or not
	 */
	Validation.failed = function(){
		return ! $.isEmptyObject(errors);
	};
	
	
	/**
	 * Returns an Array of Objects
	 * 
	 * Each object contains a field name as Key and an array of error messages
	 * eg.
	 * {
	 * 	name: ["Should contain letters only"],
	 *  password: [
	 * 		"Should contain atleast one number",
	 * 		"Should be minimum eight characters long",
	 * 		"Should contain atleast one symbol"
	 * 	]
	 * }
	 */
	Validation.field_errors = function(){
		return errors;
	};
	

	/**
	 * Return an array containing Errors
	 */
	Validation.errors = function(){
		var error_messages = [];
		
		$.each(errors, function(field_name, errors){
			error_messages = error_messages.concat(errors);
		});
		
		return error_messages;
	};
	
})(jQuery);