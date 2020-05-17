//LL(1) grammar parser generator

const ASTree = require('../ASTree');
const ASTList = require('../ASTList');
const ASTLeaf = require('../ASTLeaf');

const Name = require('../Name');
const NumberLiteral = require('../NumberLiteral');

class Parser {
    constructor(clazz){
        this.clazz  = clazz?clazz:ASTList;
        //ordered combinators
        this.combinators = [];
    }
    reset(clazz){
        this.clazz = clazz?clazz:ASTList;
        this.combinators = []
    }

    parse(lexer){
        let children = [];
        for(let ele of this.combinators){
            children.push(ele.parse(lexer));
        }
        return this.create(children);
    }
    match(lexer){
        if(this.combinators.length==0)return true;

        return this.combinators[0].match(lexer);
    }
     /**
     * create an ast ,factory method
     * @param {*} args - arguments for create an Object
     * @return {astleaf}
     */
    create(){
        if(!this.clazz)return null;
        
        if(this.clazz[Parser.createrName] && this.clazz[Parser.createrName] instanceof Function){
            //invoke create method of the class
            return this.clazz[Parser.createrName](...arguments);
        }else if(this.clazz instanceof Function){
            //use new to create
            return Reflect.construct(this.clazz , arguments);
        }else if(this.clazz instanceof String){
            //create from class name(if it is already in context)
            return Reflect.construct(eval(`${this.clazz}`),arguments);
        }
        else{
            throw new Error(`AToken: illegal class ${this.clazz}`)
        }
    }


    //for user methods
    number(clazz){
        this.combinators.push(new NumToken(clazz));

        //for chain
        return this;
    }

    identifier(clazz,reserved){
        this.combinators.push(new IdToken(clazz,reserved));

        return this;
    }

    string(clazz){
        this.combinators.push(new StrToken(clazz));

        return this;
    }

    token(patterns){
        this.combinators.push(new Leaf(patterns));

        return this;
    }

    sep(patterns){
        this.combinators.push(new Skip(patterns));

        return this;
    }

    ast(parser){
        this.combinators.push(new Tree(p));

        return this;
    }

    or(parsers){
        this.combinators.push(new OrTree(parsers));

        return this;
    }

    option(parser){
        this.combinators.push(new Repeat(parser , true));

        return this;
    }

    repeat(parser){
        this.combinators.push(new Repeat(parser, false))

        return this;
    }

    expression(parser , operators, clazz){
        this.combinators.push(new Expr(clazz,operators,parser));

        return this;
    }
}
//name of the factory method(class method) to create an ast node
Parser.createrName = 'create';

Parser.rule = function(clazz){
    return new Parser(clazz)
}

module.exports = Parser;

//classes for Parser

/**essential class */
class Element{
    constructor(){

    }

    /**
     * parse pattern of this part
     * @param {Lexer} lexer 
     * @return {ASTree}
     */
    parse(lexer){return null;}

    /**
     * test if match this pattern
     * @param {Lexer} lexer 
     * @return {Boolean}
     */
    match(lexer){return false;}
}
/**
 * parser warppers add some extra logic to decide how to use essential parser(s)
 * and then they invoke relevant parser's parse method and return its result(an astree)
 */
/**parser warpper ,branch control : directly one way */
class Tree extends Element{
    constructor(parser){
        super();
        this.parser = parser;
    }

    parse(lexer){
        return this.parser.parse(lexer);
    }

    match(lexer){
        return this.parser.match(lexer)
    }
}

/**parser warpper ,branch control: or */
class OrTree extends Element{
    /**
     * 
     * @param {Array[Parser]} parsers 
     */
    constructor(parsers){
        super();
        this.parsers = parsers;
    }

    parse(lexer){
        let p = this.choose(lexer);
        return p.parse(lexer);
    }
    match(lexer){
        return this.choose(lexer)!=null;
    }
    choose(lexer){
        for(let p of this.parsers){
            if(p.match(lexer)){
                return p;
            }
        }

        return null;
    }

    /**
     * add an optional branch to this or tree
     * @param {Parser} parser 
     */
    insert(parser){
        if(!this.parsers || !(this.parsers instanceof Array)){
            this.parsers = []
        }
        this.parsers.push(parser);

        return this;
    }
}

/**parser warpper ,branch control : repeat */
class Repeat extends Element{
    constructor(parser , isOnlyOnce){
        super();
        this.parser  = parser;
        this.once = !!isOnlyOnce;
    }

    parse(lexer){
        let res = []
        while(this.parser.match(lexer)){
            res.push(this.parser.parse(lexer));
            if(this.once){
                break;
            }
        }
        return res;
    }

    match(lexer){
        return this.parser.match(lexer);
    }
}

/**parser component, basic data type token, token : one of the smallest unit for parsing(another is not-skip terminal sybmol ) */
class AToken extends Element{
    constructor(clazz){
        super();
        this.clazz = clazz?clazz :ASTLeaf;
    }

    parse(lexer){
        let t = lexer.read();
        if(this.test(t)){
            return this.create(t);
        }else{
            throw new Error(`parser :AToken receive unexpected token '${t.getText()}' `)
        }
    }
    /**
     *abstract interface(I should ts ) test if token is what we want
     * @param {Token} tok 
     * @return {Boolean} 
     */
    test(){
        return false;
    }

    match(lexer){
        return this.test(lexer.peek(0))
    }

    /**
     * create an ast ,factory method
     * @param {*} args - arguments for create an Object
     * @return {astleaf}
     */
    create(){
        if(!this.clazz)return null;
        
        if(this.clazz[Parser.createrName] && this.clazz[Parser.createrName] instanceof Function){
            //invoke create method of the class
            return this.clazz[Parser.createrName](...arguments);
        }else if(this.clazz instanceof Function){
            //use new to create
            return Reflect.construct(this.clazz , arguments);
        }else if(this.clazz instanceof String){
            //create from class name(if it is already in context)
            return Reflect.construct(eval(`${this.clazz}`),arguments);
        }
        else{
            throw new Error(`AToken: illegal class ${this.clazz}`)
        }
    }
}



/**parser component,  identifier token, token : one of the smallest unit for parsing(another is not-skip terminal sybmol ) */
class IdToken extends AToken{
    constructor(clazz , reserved){
        super(clazz);

        this.reserved =( !reserved)?new Set():(reserved instanceof Set)?reserved:(reserved[Symbol.iterator] instanceof Function)?new Set(reserved):new Set();
    }

    test(tok){
        return tok.isIdentifier() && !this.reserved.has(tok.getText());
    }
}


/**parser component,  string token, token : one of the smallest unit for parsing(another is not-skip terminal sybmol ) */
class NumToken extends AToken{
    constructor(clazz ){
        super(clazz);
    }
    test(tok){
        return tok.isNumber();
    }
}

class StrToken extends AToken{
    constructor(clazz){
        super(clazz);
    }
    test(tok){
        return tok.isString();
    }
}

/**parser component , non-skip terminal symbol */
class Leaf extends Element{
    /**
     * 
     * @param {[String|RegExp]} patterns 
     */
    constructor(patterns){
        super();
        this.pats = patterns?patterns : [];
    }
    parse(lexer){
        let t
        if( this.match(lexer)){
            t = lexer.read();
            return new ASTLeaf(t);
        }else{
            throw new Error(`Leaf: unexpected token ${t}`)
        }
    }

    match(lexer){
        let t = lexer.peek(0);
        if(t.isIdentifier()){
            for(let pat of this.pats){
                if(pat instanceof String){
                    if(pat === t.getText()){
                        return true;
                    }
                }else{
                    if(new RegExp(pat).test(t.getText)){
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

class Skip extends Leaf{
    constructor(patterns){
        super(patterns);
    }
    parse(lexer){
        let t
        if( this.match(lexer)){
            t = lexer.read();
            return null;
        }else{
            throw new Error(`Leaf: unexpected token ${t}`)
        }
    }
}

class Expr extends Element{
    constructor(clazz, operatorsLis,parser){
        this.clazz = clazz?clazz:ASTList;
        this.operators = operatorsLis instanceof Object ? operatorsLis:{};  
        this.factor = parser;
    }
      /**
     * create an ast ,factory method
     * @param {*} args - arguments for create an Object
     * @return {astlist}
     */
    create(){
        if(!this.clazz)return null;
        
        if(this.clazz[Parser.createrName] && this.clazz[Parser.createrName] instanceof Function){
            //invoke create method of the class
            return this.clazz[Parser.createrName](...arguments);
        }else if(this.clazz instanceof Function){
            //use new to create
            return Reflect.construct(this.clazz , arguments);
        }else if(this.clazz instanceof String){
            //create from class name(if it is already in context)
            return Reflect.construct(eval(`${this.clazz}`),arguments);
        }
        else{
            throw new Error(`Expr: illegal class ${this.clazz}`)
        }
    }
    match(lexer){
        return this.factor.match(lexer);
    }

    addOpe(name, level, isLeft){
        this.operators[name] = new Precedence(level , isLeft); 
    }

    deleOpe(name){
        Reflect.deleteProperty(this.operators , name);
    }

    parse(lexer){
        this.lexer = lexer;
        let right = this.factor.parse(lexer);

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

        let right = this.factor.parse(this.lexer);

        let nextOp;
        while((nextOp = this.nextOpPrece()) !=null && this.rightIsExpr(prece , nextOp)){
            right = this.doShift(right , nextOp);
        }
        return this.create(left , op , right);
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



