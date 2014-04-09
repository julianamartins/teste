casper.start('http://aquilasvn:8080/view/PHP%20Projects/job/php-unit-baseclass/', function() { 
      this.capture('html', undefined, {
        format: 'jpg',
        quality: 75
    });
      casper.test.comment("Hi, I'm a comment");
      this.test.assertHttpStatus(200, ' is up');
  this.test.pass('PASSOU!!!!!!'); 

}); 

casper.run(function() { 
  this.test.done(); 
  casper.test.renderResults(true, 0, 'log1.xml');
}); 