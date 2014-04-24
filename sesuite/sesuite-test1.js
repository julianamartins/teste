var phantomcss = require('./../phantomcss.js');

phantomcss.init({

	fileNameGetter: function(root,filename){ 
        // globally override output filename
        // files must exist under root
        // and use the .diff convention
        var name = root+'/'+filename;
        if(fs.isFile(name+'.png')){
            return name+'.diff.png';
        } else {
            return name+'.png';
        }
    }
    
});

var utils = require("utils");
var timesRequest = [];
var timeIni = "";
var x = require('casper').selectXPath;
var fs = require('fs');
var htmlBase = "";
var htmlContent = "";


casper.test.begin('Test SE Suite', 2, function suite(test) {
	casper.start('http://192.168.1.103:82/softexpert/login', function() {

		this.fillSelectors('form.login-form', {
			'input[id="user"]':    'juliana',
			'input[id="password"]':    '1'
	    }, true);

	   	this.click('button[class="btn btn-cancel loginbtn"]');

	});

	casper.options.waitTimeout = 500000;
	casper.viewport(1366,768);


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
				this.then(function(){
					var links = getPageLinks();
					htmlBase = document.createElement('html');
	   				html = fs.read('tmpl/base.html');
	   				htmlBase.innerHTML = html;
					var table = htmlBase.querySelector(".tableContainer");
					var i = -1;
					var countTr = 0;
					var tr = document.createElement('tr');

					this.repeat(1, function() {
						if((countTr%2 == 0) && countTr != 0){
							table.appendChild(tr);
							tr = document.createElement('tr');
						}
						countTr +=1;
						
						this.then(function(){
							this.wait(1000, function() {});
							timesRequest = []; //Limpa array com requests
							timeIni = new Date().getTime(); //Tempo inicial = antes de clicar
							this.click('a[data-oid="'+links[i]+'"]');
						});
						this.then(function(){
							casper.waitFor(function check() {
							    return this.evaluate(function() {
							        return document.getElementById("iframe").contentDocument.readyState == "complete";
							    });
							},
							function then() {
								var time = (new Date().getTime() - timeIni) / 1000;
								var pgtitle = this.getTitle();
								test.assertEquals(true, time < 3);
								//this.capture('screenshots/'+cmps[x-1]+'-'+i+'.png'); 
								phantomcss.screenshot('.se-body', cmps[x-1]+'-'+i);  
								tableContent(i,pgtitle,time,cmps[x-1]+'-'+i);			
								tr.appendChild(htmlContent);
							});
						});
						this.then(function(){
							if(i < (links.length-1)){
								if(!this.exists('a[data-oid="'+links[i+1]+'"]'))
						    		this.click('a[class="'+cmps[x-1]+'"]');
							}
						    else{
						    	table.appendChild(tr);
						    	fs.write('pages/'+cmps[x-1]+'.html', "'"+htmlBase.innerHTML+"'","w");
						    }
						});
						i++;
					});

				});
				x++;
			});
			
		});
	});

	casper.then(function() { 
		this.click('a[id="logout-btn"]');
		phantomcss.compareAll();
	});

	casper.run(function() { 
		test.done();
		casper.test.renderResults(true, 0, 'log-sesuite.xml');
	}); 
});

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

function tableContent(i,pgtitle,time,img){
	htmlContent = document.createElement('td');
   	var content = fs.read('tmpl/content.html');
	var longest = timesRequest.sort(function(reqa, reqb) {
	    return reqb.time - reqa.time;
	})[0];
	content = content.replace(/{titulo}/g,pgtitle).replace(/{time}/g,time).replace(/{id}/g,i).replace(/{image}/g,img).replace(/{longest}/g,longest.time/1000);
	content = content.replace(/{qtd}/g,tamArray(timesRequest));
	
	htmlContent.innerHTML = content;
	tableRequest();
}

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

/*Função criada por bug no casper que retornava o length errado*/
function tamArray(array){
	var count = 0;
	for(i in array)
		count++;
	return count;
}

function tableRequest(){
	var tableR = htmlContent.querySelector("#tableContent");
	for(i in timesRequest){	
		var tr = document.createElement('tr');
		var content = document.createElement('td');
		content.setAttribute("style","width:20%");
		content.innerHTML = (timesRequest[i].time/1000);
		tr.appendChild(content);
		var content = document.createElement('td');
		var input = document.createElement('input');
		input.textContent = timesRequest[i].url;
		input.setAttribute("style","width: 100%;");
		input.setAttribute("value",timesRequest[i].url);
		content.appendChild(input);
		tr.appendChild(content);
		tableR.appendChild(tr);
	}

}