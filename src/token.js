class Token{
    constructor(line){
        this.lineNumber = line;
    }

    isIdentifier(){
        return false;
    }

    isNumber(){
        return false;
    }

    isString(){
        return false;
    }

    getNumber(){
        throw new Error("not number token");
    }

    getText(){
        return "";
    }

    getLineNumber(){
        return this.lineNumber;
    }
}

Token.EOF = new Token(-1);

Token.EOL = new Token(-2);

Token.EOL.getText = function(){return '\\n';}


module.exports = Token;