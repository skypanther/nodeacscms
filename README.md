# NodeACS CMS

Skeletal CMS built with Node.js with data storage in the Appcelerator ACS cloud.

## Features

Not much more than logging in right now, but I'll get there somdeday.

Goals:

* News posting and RSS feed -- data stored in ACS Posts, consumable as ACS data or an RSS feed
* Photo posting / retrieval
* User management with simple role-based security
* Places management -- for use with Checkins feature of ACS, which could be consumed in a companion app


## Requirements

* Node.js - tested with 0.8.14 but probably works with others
* NodeACS - tested with 0.9.30 - install via NPM, see http://nodeacs.cloud.appcelerator.com/guides/quickstart for info
* An Appcelerator developer account - sign up at http://my.appcelerator.com/auth/signup

Additionally, this was tested and works on a Mac. I have no clue what you need to do differently on Windows or Linux. Probably  nothing as long as you can get node working properly. Sorry.

## Setup

1. Create an ACS app: <a href="https://my.appclerator.com">Login to my.appcelerator.com</a>
2. Record the three oAuth security keys: App key, key, and shared secret
3. Create a User object via the ACS control panel. Make sure this user is marked as an admin user. Note the email address and password for that user; you will need it later to log onto the CMS.
4. Edit controllers/application_sample.js and enter your keys where indicated. Save/rename the file as application.js
5. Run `acs run` to run locally, access via browser
6. Publish with `acs publish` -- see the <a href="http://nodeacs.cloud.appcelerator.com/guides/quickstart">NodeACS docs</a> for more info.

# Credits

Developed by the Appcelerator Solutions and Appcelerator Sales Engineering team with extensions by @skypanther. Big thanks to @jamilspain and @grantges!


