const ASTree = require('./ASTree');

class ASTLeaf extends ASTree{
    constructor(token){
        if(token instanceof Token){
            this._token = token;
        }else{
            throw new Error('ASTLeaf : token must be an instance of Token');
        }

    }
    token(){
        return this._token;
    }

    toString(){
        return this._token.getText();
    }

    location(){
        return `at line ${this._token.lineNumber}`;
    }


}

module.exports = ASTLeaf;