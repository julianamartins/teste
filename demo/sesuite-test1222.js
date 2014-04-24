

/*
	Require and initialise PhantomCSS module
	Paths are relative to CasperJs directory
*/
var phantomcss = require('./../phantomcss.js');

phantomcss.init({
});


var utils = require("utils");
var timesRequest = [];
var timeIni = "";
var x = require('casper').selectXPath;
var fs = require('fs');
var htmlBase = "";
var htmlContent = "";


casper.start('http://192.168.1.103:82/softexpert/', function() {

	this.fillSelectors('form.login-form', {
		'input[id="user"]':    'juliana',
		'input[id="password"]':    '1'
    }, true);

   	this.click('button[class="btn btn-cancel loginbtn"]');

});

casper.viewport(1024, 520);
casper.options.waitTimeout = 5000000;

casper.then(function(){
   	this.wait(7000, function() {});
});

casper.then(function(){
   	this.waitFor(function check() {
	    return this.exists('a[class="products-product-73"]');
	}, function then() {
		var cmps = getCmps();
		var x=1;
		this.repeat(1, function() {
			this.click('a[class="'+cmps[x]+'"]');
			var i = 0;
			this.then(function(){
				var links = getPageLinks();

				this.repeat(1, function() {

					this.then(function(){
						this.wait(1000, function() {});
						this.click('a[data-oid="'+links[i]+'"]');
					});
					this.then(function(){
						casper.waitFor(function check() {
						    return this.evaluate(function() {
						        return document.getElementById("iframe").contentDocument.readyState == "complete";
						    });
						},
						function then() {
							phantomcss.screenshot('.se-body', cmps[x-1]+'-'+i);
						});
					});
					i++;
				});

			});
			x++;
		});
		
	});
});

casper.then(function() { 
	phantomcss.compareAll();
						
});

casper.run(function() { 
	this.exit();
	casper.test.renderResults(true, 0, 'log1.xml');
}); 

/*
casper.on('resource.requested', function(resource) {
    timesRequest[resource.id] = {
        start: new Date().getTime(),
        url: resource.url
    };
});
casper.on('resource.received', function(resource) {
    timesRequest[resource.id].time = new Date().getTime() - timesRequest[resource.id].start;
    timesRequest[resource.id].status =  resource.status;
});
*/

function getPageLinks(){
	return casper.evaluate(function(){
		var query = document.querySelectorAll(".section-container > .screen-list > li > [data-oid]");
        var links = [];
        for( var i = 0; i < query.length; i++ ) {
			if(query[i].getAttribute('data-oid') != "undefined" && links.indexOf(query[i].getAttribute('data-oid')) == -1)
	            links.push(query[i].getAttribute('data-oid'));
	    }
        return links;
    });
}

function getCmps(){
	return casper.evaluate(function(){
		var query = document.querySelectorAll(".carousel-inner > div > ul > li > a");
		var cmps = [];
		for( var i = 0; i < query.length; i++ ) {
	        cmps.push(query[i].getAttribute('class'));
	    }
	    return cmps;
	});
}

