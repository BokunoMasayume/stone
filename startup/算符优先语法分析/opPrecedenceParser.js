//operator precedence parser
//more general expression parser than exprParser(LL)
//support every possible binary(and unit) expression 

//for-test require 
const Lexer = require('../../src/Lexer');
//for-module require
//for-module requires
const ASTree = require('../../src/ASTree');
const ASTLeaf = require('../../src/ASTLeaf');
const ASTList = require('../../src/ASTList');
    //ast leaf subclass
const Name = require('../../src/Name');
const NumberLiteral = require('../../src/NumberLiteral');
    //ast list subclass
const BinaryExpr = require('../../src/BinaryExpr');


class OpPrecedenceParser{
    constructor(lex, operatorsLis){
        this.lexer = lex;
        this.operators = operatorsLis instanceof Object ? operatorsLis:{};  
    }

    addOpe(name, level, isLeft){
        this.operators[name] = new Precedence(level , isLeft); 
    }

    deleOpe(name){
        Reflect.deleteProperty(this.operators , name);
    }

    expression(){
        let right = this.factor();

        let nextOp;
        while( (nextOp = this.nextOpPrece()) !=null ){
            //still have next operator
            right = this.doShift(right , nextOp);
        }
        return right;
    }

    nextOpPrece(){
        let t = this.lexer.peek(0);
        if(t.isIdentifier()){
            return this.operators[t.getText()];
        }
        else{
            return null;
        }
    }

    /**
     * get left tree and operator , read the file , and generate one parent tree
     * @param {ASTree} left - the left subtree
     * @param {*} prece - the operator's precedence
     * @return {ASTree} the parent tree
     */
    doShift(left , prece){
        let op = new ASTLeaf(this.lexer.read());

        let right = this.factor();

        let nextOp;
        while((nextOp = this.nextOpPrece()) !=null && this.rightIsExpr(prece , nextOp)){
            right = this.doShift(right , nextOp);
        }
        return new BinaryExpr([left , op , right]);
    }

    rightIsExpr(prece, nextPrece){
        if(nextPrece.isLeftAssoc){
            //left associate 
            //when have same precedence, left expression combines first
            return nextPrece.level > prece.level; 
    
        }
        else{
            //right associate
            //when have same precedence, right expression combines first
            return nextPrece.level >= prece.level;
        }
    }

    factor(){
        //NUMBER | "(" expression ")"

        let left =null;
        if(this.isToken("(")){
            //consume "("
            this.token("(");

            left = this.expression();

            //consume ")"
            this.token(")");

        }else{
            //just number
            let t = this.lexer.read();
            if(t.isNumber()){
                left = new NumberLiteral(t);
            }else{
                //throw error
                throw Error(`exprParser: want a number but received ${t.getText()}`);
            }
        }

        return left;
    }

    /**
     * peek 1 token and check if its text is tok
     * @param {String} tok 
     */
    isToken(tok){
        let t = this.lexer.peek(0);
        // console.log(t)
        // the text of t is same as tok, and t is an id (distinguish from string token which the text is tok )
        return (  (t.getText() === tok) && t.isIdentifier() );
    }

    /**
     * read 1 token , will not  be included in ast
     * @param {string} tok 
     */
    token(tok){
        let t = this.lexer.read();
        if( !( t.getText() === tok && t.isIdentifier() ) ){
            //not read wanted tok value , throw an error
            throw new Error(`exprParser: ${tok} is wanted but get illegal terminal symbol '${t.getText()}'`);
        }
    }

}



/** inner class, describe operators' properties */
class Precedence{
    /**
     * create a precedence desc of some operator
     * @param {integer} level - precedence, larger, more priority
     * @param {boolean} isLeft - left asscoiate or not
     */
    constructor(level , isLeft){
        this.level = level;
        this.isLeftAssoc = isLeft;
    }
}

module.exports = OpPrecedenceParser;

module.exports.test = function(path){

    let parser = new OpPrecedenceParser(new Lexer(path));

    parser.addOpe("-", 1, true);
    parser.addOpe("+", 1, true);
    parser.addOpe('*', 2, true);
    parser.addOpe("/",2, true);

    return parser
}