const ASTLeaf = require('./ASTLeaf');

class Name extends ASTLeaf{
    constructor(token){
        super(token);
    }

    name(){
        this.token().getText();
    }

}

module.exports = Name;