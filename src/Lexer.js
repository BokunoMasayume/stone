const fs = require('fs');
const Token = require('./token')


class Lexer{
    constructor(filePath){
        this.lineNum = 0;

        this.hasMore = true;

        this.sourceReader = fs.createReadStream(filePath);

        if(! this.sourceReader)throw new Error(`fail to open file '${filePath}'`);
        
        this.tokenQueue = [];

        this._preLineCache = "";

       // this.bufferSize = undefined; //default size

    }

    /**
     * 
     * @param {number} lineNum - the number of the line
     * @param {array} matcher - the result of regexp.exec
     */
    addToken(lineNum , matcher){
        if(! matcher){
            return null;
        }
        if(matcher == '\\n'){
            // is EOL
            this.tokenQueue.push(Token.EOL);
            return Token.EOL;
        }

        if(matcher[2]){
            // is comment
            return false;
        }

        let token = null;

        if(matcher[3]){
            //is number
            token = new NumToken(lineNum , parseFloat(matcher[3]) ) ;
            this.tokenQueue.push(token);
        }
        else if(matcher[4]){
            //is string

            token = new StrToken(lineNum , this.strToLiteralStr(matcher[4]) );
            this.tokenQueue.push(token);
        }
        else {
            // is identifier
            token = new IdToken(lineNum , matcher[1] );
            this.tokenQueue.push(token);
        }
       

        return token;

    }


    readBuffer(){
        let buf = this.sourceReader.read(this.bufferSize);
        if(! buf){
            this.hasMore = false;
            buf = [""];
            this.sourceReader.close();
        }
        else{
            buf = buf.toString().split('\n');
        }

        //read() not cut by \n ,so 
        buf[0] = this._preLineCache + buf[0];
        if(buf.length >1){
            this._preLineCache = buf.pop();
        }else{
            this._preLineCache = "";
        }
        console.log(buf);

        buf.forEach((line, idx)=>{
            //line number starts form 1
            this.lineNum ++;

            //initialize token regexp object
            Lexer.tokenReg.lastIndex = 0;

            let matcher = null;
            //add normal tokens of this line
            while( matcher = Lexer.tokenReg.exec(line)){
                this.addToken(this.lineNum , matcher);
            }
            //add 'end of line' token
            this.addToken(this.lineNum , Token.EOL);
            
        });

        // if(! this.hasMore){
        //     this.addToken(this.lineNum , Token.EOF)
        // }
    }

    fillQueue(size){
        while(this.tokenQueue.length < size){
            if(this.hasMore){
                this.readBuffer();
            }else{
                return false;
            }
        }
        return true;
    }

    read(){
        //read first token
        if( this.fillQueue(1) ){
            return this.tokenQueue.shift();
        }else{
            return Token.EOF;
        }
    }

    /**
     * 
     * @param {number} step - when step=0 , just peek the current token. 
     */
    peek(step){
        //read random index token
        if(this.fillQueue(step +1) ){
            return this.tokenQueue[step];
        }else{
            return  Token.EOF;
        }
    }

    /**
     * 
     * @param {String} str 
     * @example hello,world\n => hello,world[换行enter]
     */
    strToLiteralStr(strin){
        let str = strin.split("");
        let octNum = /[0-9a-zA-Z]+/g;//  set g to use lastIndex property
        for(let i=0 ; i<str.length ; i++){
            if(str[i]==='\\'){
                //转义符 esc escape character
                switch (str[i+1]){
                    //reference to tokenReg 
                    case 'n':
                        str.splice(i,2  , '\n');
                        break;
                    case 't':
                        str.splice(i , 2 , '\t');
                        break;
                    case 'r':
                        str.splice(i , 2 , '\r');
                        break;
                    case 'b':
                        str.splice(i, 2 , '\b');
                        break;
                    case 'f':
                        str.splice(i, 2 , '\f');
                        break;
                    case 'v':
                        str.splice(i, 2, '\v');
                        break;
                    case 'u'://unicode
                        octNum.lastIndex = i+2;
                        let num = octNum.exec(str);
                        str.splice(i, num.length+2  , String.fromCodePoint( parseInt(num , 16) ));
                        break;
                    default:// like " ' \
                        str.splice(i, 2 , str[i+1]);

                }
            }
        }



        return str.join("");
    }

}





//              空白字符 ( 注释 ) | （ 整数 ） | （ “ （字符串 ）” ）| （标识符） | == | >= | <= | && | ||
//exec 
//0 : 整体匹配的
//1 : total token matched ,第一个括号
//2 : 注释
//3 : 数字
//4 : 字符串 " is the special one in regexp expression
//5 /1 : 标识符
//1 : 一些标点
Lexer.tokenReg = /\s*((\/\/.*)|((?:[0-9]+\.?[0-9]*(?:[eE][0-9]+)?)|(?:[0-9]*\.?[0-9]+(?:[eE][0-9]+)?))|"((?:\\"|[^"])*)"|([a-zA-Z_][a-zA-Z_0-9]*)|==|>=|<=|&&|\|\||[()[\]{},:;|&<=>?!~^$%+\-*/])/g;

function isString(val){
    return typeof val === "string" || val instanceof String;
}

class NumToken extends Token{
    /**
     * 
     * @param {number} lineNum 
     * @param {string|number} value 
     */
    constructor(lineNum , value){
        super(lineNum);
        if(isString(value)){
            this.value = parseFloat(value);
        }else{
            this.value = value;
        }
    }

    isNumber(){
        return true;
    }

    getText(){
        return this.value + "";
    }

    getNumber(){
        return this.value;
    }

}

class IdToken extends Token{
    /**
     * 
     * @param {number} lineNum 
     * @param {string} value 
     */
    constructor(lineNum , value){
        super(lineNum);
        this.text = value;


    }

    isIdentifier(){
        return true;
    }

    getText(){
        return this.text;
    }
}


class StrToken extends Token{
    constructor(lineNum , str){
        super(lineNum);

        this.literal = str;
    }

    isString(){
        return true;
    }

    getText(){
        return this.literal;
    }
}

module.exports = Lexer;