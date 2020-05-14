const ASTList = require('./ASTList');

class BinaryExpr extends ASTList{
    constructor(children){
        super(children);

    }

    left(){
        return this.child(0);
    }
    
    operator(){
        return this.child(1).token().getText();
    }

    right(){
        return this.child(2);
    }
}

module.exports = BinaryExpr;