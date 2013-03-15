/**
 * Salesforce module
 */
 
// Http helper
var http = require('http');
 
/**
 * Salesforce object
 * @param {Object} params Params for this salesforce instance
 * @example
 * {
 *      loginUrl: ,
 *      clientId: , (also known as Consumer Key)
 *      redirectUri: ,
 *      apiVersion:
 * }
 * e.g.
    var SFModule = require("salesforce");
    var SFInstance = new SFModule({
        loginUrl: "https://login.salesforce.com/",
        clientId: "",
        redirectUri: "https://login.salesforce.com/services/oauth2/success",
        apiVersion: "v24.0",
    });
 */
function Salesforce(params) {
    params = params || {};
    this.loginUrl = params.loginUrl;
    this.clientId = params.clientId;
    this.clientSecret = params.clientSecret;
    this.redirectUri = params.redirectUri;
    this.apiVersion = params.apiVersion;
	//this.currentUser = Ti.App.Properties.getString('currentUser') || params.currentUser;
 
    // Persistent across Sessions
    //this.securityToken = Ti.App.Properties.getString('securityToken') || params.securityToken;
    
    // Set when logged in
    this.instanceUrl = Ti.App.Properties.getString('instanceUrl') || null;
    this.accessToken = Ti.App.Properties.getString('accessToken') || null;
    this.refreshToken = Ti.App.Properties.getString('refreshToken') || null;
	this.headers = [
		{ name: "Authorization", value: "OAuth "+ this.accessToken },
		{ name: "X-User-Agent", value: "salesforce-toolkit-rest-javascript/" + this.apiVersion },
		{ name: "Content-Type", value: "application/json" }
	];
    this.isLoggedIn = false;
    var that = this;
 
    /**
     * Get the full path to the auth url
     * @param {String} loginUrl
     * @param {String} clientId
     * @param {String} redirectUri
     */
    this.getAuthorizeUrl = function(loginUrl, clientId, redirectUri){
        return this.loginUrl + 'services/oauth2/authorize?display=touch'
            + '&response_type=token&client_id='+escape(this.clientId)
            + '&redirect_uri='+escape(this.redirectUri);
    };
    
    /**
     * Setter for the Security Token. The token is required if your using the apiLogin function
     * outside of a trusted network.
     * @param {String} token
     */
    this.setSecurityToken = function(token){
    	this.securityToken = token; 
    	Ti.App.Properties.setString('securityToken', token);
    };
    
     /**
     * Get the full path to the auth url
     * @param {Function} callback
     *
     * Ex. Response
     *	{
	 *	    "id": "https://login.salesforce.com/id/00Dd0000000i47PEAQ/005d0000001br3NAAQ",
	 *	    "issued_at": "1360015998283",
	 *	    "instance_url": "https://na14.salesforce.com",
	 *	    "signature": "WeyeKB2/KCPODOBG/zhDu/tUYGXNyDUWr2mhVuW2j38=",
	 *	    "access_token": "00Dd0000000i47P!AQ8AQC3MD0zI2mZBo.d.Zj6ujo12vMv3GgfuoUE.RCTIoQnnSjpGRPT_x_40BF8bQPlUuXsvS0FTmO9VBtgM7srgj6xjAHVL"
	 *	}
	*/
    this.apiLogin = function(username, password, callback) {
   		http.request({
            type: 'POST',
            format: 'json',
            url: that.loginUrl,
            data: {
            	grant_type: "password",
            	username: username,
    			password: password + that.securityToken,
    			client_id: that.clientId,
    			client_secret: that.clientSecret
            },
            success: function(request) {
	            Ti.API.debug(request);
 
	            if(request.access_token) {
		            that.accessToken = request.access_token;
		            Ti.App.Properties.setString('accessToken', that.accessToken);
	            }
 
				if(request.instance_url) {
					that.instanceUrl = request.instance_url;
					Ti.App.Properties.setString('instanceUrl', that.instanceUrl);
				}
 
	            if(request.id) {
		            var url = that.loginUrl.replace("services/oauth2/token", "");
		            that.currentUser = request.id.replace( url + "id/", "");
		            Ti.App.Properties.setString('currentUser', that.currentUser.substring(19,that.currentUser.length));
		            Ti.API.debug(that.currentUser);
	            }
 
	            that.headers = [
	           		{ name: "Authorization", value: "OAuth "+ that.accessToken },
	           		{ name: "X-User-Agent", value: "salesforce-toolkit-rest-javascript/" + that.apiVersion },
		            { name: "Content-Type", value: "application/json" }
	           	];
 
    			Ti.API.debug("SalesForce Login Successful - Token: " + that.accessToken);
    			
                if(request) { callback(request); }
            },
            failure: that.onErrorHandler
        });
    };
 
    /**
     * Start the login process
     */
    this.login = function(callback) {
        var newWin = Ti.UI.createWindow({
            width: '65%',
            height: '65%'
        });
 
        var cancel = Ti.UI.createButton({ title: 'Close' });
        cancel.addEventListener('click', function() {
            newWin.close();
            newWin = null;
        });
        newWin.leftNavButton = cancel;
 
        var webView = Ti.UI.createWebView({ url: this.getAuthorizeUrl(this.loginUrl, this.clientId, this.redirectUri) });
        newWin.add(webView);
        newWin.open();
 
        newWin.addEventListener('close', function() {
            if(callback) { callback(); }
        });
 
        webView.addEventListener('load', function(e) {
            var loc = unescape(webView.url);
 
            var oauthResponse = {};
 
            var fragment = loc.split("#")[1];
 
            if (fragment) {
                var nvps = fragment.split('&');
                for (var nvp in nvps) {
                    var parts = nvps[nvp].split('=');
                    oauthResponse[parts[0]] = unescape(parts[1]);
                }
            }
 
            if (typeof oauthResponse === 'undefined' || typeof oauthResponse['access_token'] === 'undefined') {
                // TODO - Handle this accordingly
            } else {
                newWin.close();
                newWin = null;
                // NOTE You should never reveal these in the console while in production
                that.instanceUrl = oauthResponse.instance_url;
                that.accessToken = oauthResponse.access_token;
                that.oauthHeader.value = "OAuth "+that.accessToken;
                that.refreshToken = oauthResponse.refresh_token;
                that.isLoggedIn = true;
 
                Ti.App.Properties.setString('instanceUrl', that.instanceUrl);
                Ti.App.Properties.setString('accessToken', that.accessToken);
                Ti.App.Properties.setString('refreshToken', that.refreshToken);
            }
        });
    };
 
    /**
     * Logout existing user
     */
    this.logout = function() {
        this.instanceUrl = null;
        this.accessToken = null;
        this.refreshToken = null;
        Ti.App.Properties.setString('instanceUrl', null);
        Ti.App.Properties.setString('accessToken', null);
        Ti.App.Properties.setString('refreshToken', null);
        this.isLoggedIn = false;
    };
 
    /**
     * Get all available objects for this salesforce instance
     * @param {Function} callback
     */
    this.getObjects = function(callback) {
        http.request({
            type: 'GET',
            format: 'json',
            url: that.instanceUrl + '/services/data/' + that.apiVersion + '/sobjects/',
            headers: that.headers,
            success: function(request) {
                callback(request);
            },
            failure: that.onErrorHandler
        });
    };
 
    /**
     * Get object meta data
     * @param {String} objectType
     * @param {Function} callback
     */
    this.metadata = function(objectType, callback) {
        http.request({
            type: 'GET',
            format: 'json',
            url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + objectType + '/',
	        headers: that.headers,
            success: function(request) {
                callback(request);
            },
            failure: that.onErrorHandler
        });
    };
 
    /**
     * Get all individual object meta data (granular)
     * @param {String} objectType
     * @param {Function} callback
     */
    this.describe = function(objectType, callback) {
        http.request({
            type: 'GET',
            format: 'json',
            url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + objectType + '/describe/',
	        headers: that.headers,
            success: function(request) {
                callback(request);
            },
            failure: that.onErrorHandler
        });
    };
 
    /**
     * Create new record on object
     * @param {String} objectType
     * @param {Object} data
     * @param {Function} callback
     */
    this.create = function(objectType, data, callback) {
        http.request({
            type: 'POST',
            format: 'json',
            url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + objectType + '/',
            data: data,
	        headers: that.headers,
            success: function(request) {
                callback(request);
            },
            failure: that.onErrorHandler
        });
    };
 
    /*
     * Retrieves field values for a record of the given type.
     * @param {String} objectType
     * @param {String} id
     * @param {String} fieldList Comma-separated list of fields where you need values
     * @param {Function} callback
     * @param {Object} params Optional params to be sent through the callback if needed
     */
    this.retrieve = function(objectType, id, fieldList, callback, params) {
        fieldList = (fieldList) ? '?fields=' + fieldList : '';
        http.request({
            type: 'GET',
            format: (objectType === 'Attachment') ? 'data' : 'json',
            url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + objectType + '/' + id + fieldList,
	        headers: that.headers,
            ondatastream : function(progress){
                if (params.ondatastream){
                    params.ondatastream(progress);
                }else{
                }
            },
            success: function(request) {
                callback(request, params);
            },
            failure: function(e) {
                callback(null, params);
                that.onErrorHandler(e);
            }
        });
    };
 
    /*
     * Upsert - creates or updates record of the given type, based on ID
     * @param {String} objectType
     * @param {String} fieldId The field ID name e.g. "eventforce__Track__c"
     * @param {String} id External ID value
     * @param {Object} data
     * @param {Function} callback
     */
    this.upsert = function(objectType, fieldId, id, data, callback) {
        http.request({
            type: 'POST',
            format: 'json',
            url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + objectType + '/' + fieldId + '/' + id + '?_HttpMethod=PATCH',
            data: data,
	        headers: that.headers,
            success: function(request) {
                callback(request);
            },
            failure: that.onErrorHandler
        });
    };
 
    /**
     * Update a record on an object
     * @param {String} objectType
     * @param {String} id
     * @param {Object} data
     * @param {Function} callback
     */
    this.update = function(objectType, id, data, callback) {
        http.request({
            type: 'POST',
            format: 'json',
            url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + objectType + '/' + id + '?_HttpMethod=PATCH',
            data: data,
	        headers: that.headers,
            success: function(request) {
                if(callback) { callback(request); }
            },
            failure: that.onErrorHandler
        });
    };
 
    /*
     * Deletes a specific record
     * @param {String} objectType
     * @param {String} id
     * @param {Function} callback
     */
    this.del = function(objectType, id, callback) {
        http.request({
            type: 'DELETE',
            format: 'json',
            url: this.instanceUrl + '/services/data/' + this.apiVersion + '/sobjects/' + objectType + '/' + id,
	        headers: that.headers,
            success: function(request) {
                callback(request);
            },
            failure: that.onErrorHandler
        });
    };
 
    /*
     * Executes the specified SOQL search.
     * @param {String} soql Query to execute - e.g. "SELECT Id, Name from Account ORDER BY Name LIMIT 20"
     * @param {Function} callback
     */
    this.query = function(soql, callback) {
        try{
 
        http.request({
            type: 'GET',
            format: 'json',
            url: that.instanceUrl + '/services/data/' + that.apiVersion + '/query?q=' +  encodeURIComponent(soql),
	        headers: that.headers,
            success: function(request) {
                callback({ success: true, data: request });
            },
            failure: function(error) {
                var errorStatus = that.onErrorHandler(error);
                callback({ error: errorStatus });
            }
        });
 
        }catch(ex){
            Ti.API.error("César: " + ex);
        }
    };
 
    /*
     * Executes the specified SOSL search.
     * @param {String} soql search to execute - e.g. "FIND {needle}"
     * @param {Function} callback
     */
    this.searchQuery = function(sosl, callback) {
        http.request({
            type: 'GET',
            format: 'json',
            url: this.instanceUrl + '/services/data/' + this.apiVersion + '/search?s=' +  encodeURIComponent(sosl),
	        headers: that.headers,
            success: function(request) {
                callback(request);
            },
            failure: that.onErrorHandler
        });
    };
 
    /**
     * Error handler callback for requests
     * @param {Object} error 'this' from the onerror HTTPRequest
     */
    this.onErrorHandler = function(error) {
        Ti.API.error( 'Full Error: ' + JSON.stringify(error) );
        // TODO implement appropriate error handling
        switch(error.status) {
            case 400:
                Ti.API.error( 'The request could not be understood, usually because the JSON or XML body has an error.' );
                break;
            case 401:
                // TODO Go through the 'refresh token' routine to get a new token
                Ti.API.error( 'The account used has expired or is invalid.' );
                break;
            case 403:
                // TODO Go through the 'refresh token' routine to get a new token
                Ti.API.error( 'The request has been refused. Verify that the logged-in user has appropriate permissions.' );
                break;
            case 404:
                Ti.API.error( '404: Resource not found.' );
                break;
            case 405:
                Ti.API.error( 'The method specified in the Request-Line is not allowed for the resource specified in the URI.' );
                break
            case 415:
                Ti.API.error( 'The entity specified in the request is in a format that is not supported by specified resource for the specified method.' );
                break;
            case 0:
            case 500:
                Ti.API.error( 'An error has occurred within Force.com, so the request could not be completed.' );
                var dialog = Titanium.UI.createAlertDialog({
                    title: 'Connection Issues',
                    message: 'An error occurred connecting to the server.  Please try again soon.',
                    buttonNames: ['OK']
                });
                //dialog.show();
                break;
        }
 
        return error.status;
    };
}
 
module.exports = Salesforce;