//for-test require
const Lexer = require('../../src/Lexer');
//for-module requires
const ASTree = require('../../src/ASTree');
const ASTLeaf = require('../../src/ASTLeaf');
const ASTList = require('../../src/ASTList');
    //ast leaf subclass
const Name = require('../../src/Name');
const NumberLiteral = require('../../src/NumberLiteral');
    //ast list subclass
const BinaryExpr = require('../../src/BinaryExpr');

//LL(1)文法
//四则运算
//factor: NUMBER | "(" expression ")"
//term : factor { ("*" | "/") factor }
//expression : term { ("+" | "-") term }


class ExprParser {
    /**
     * 
     * @param {Lexer} lex - create a lexer : new Lexer(file_path) 
     */
    constructor(lex){
        //set Lexer
        this.lexer = lex;
    }

    /**
     * rule for nonterminal symbol expression
     * @return {BinaryExpr | NumberLiteral} an ast leaf or tree
     */
    expression(){
        //term {("+"|"-") term} (";" | EOL | EOF)
        let left = this.term();

        while(this.isToken("+") || this.isToken("-")){
            let op = new ASTLeaf( this.lexer.read() );
            let right = this.term();
            left = new BinaryExpr([left , op , right]);
        }

        // let sep = this.lexer.read();
        return left;
    }

    /**
     * rule for nonterminal symbol term
     * @return {BinaryExpr | NumberLiteral} an ast tree
     */
    term(){
        //factor {( "*" | "/" ) factor}
        let left = this.factor();
        while(this.isToken("*") || this.isToken("/") ){
            let op = new ASTLeaf(this.lexer.read());
            let right = this.factor();

            left = new BinaryExpr([left,  op , right]);
        }

        return left;

    }

    /**
     * rule for nonterminal symbol factor
     * @return {BinaryExpr |NumberLiteral} an ast tree
     */
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

module.exports = ExprParser;


// function test(){
//     let parser = new ExprParser(new Lexer("./test.txt"));
//     let a = parser.expression();
//     let b = parser.expression();
// }