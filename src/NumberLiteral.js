const ASTLeaf = require('./ASTLeaf');

class NumberLiteral extends ASTLeaf{
    constructor( token ){
        super(token);
    }

    value(){
        return this.token().getNumber();
    }

    
}

module.exports = NumberLiteral;