<?php
class MoneyTest extends PHPUnit_Framework_TestCase
{
    
    public function testCanBeNegated()
    {
        require_once('src/Money.php');
        // Arrange
        $a = new Money(1);

        // Act
        $b = $a->negate();

        // Assert
        $this->assertEquals(1, $b->getAmount());
    }

    // ...
}

?>