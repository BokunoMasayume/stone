const ASTree = require('./ASTree');
const Token = require('./token')

class ASTLeaf extends ASTree{
    constructor(token){
        super();
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