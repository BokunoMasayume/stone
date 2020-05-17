const ASTree = require('./ASTree');

class ASTList extends ASTree{
    constructor(children){
        super();
        if( !( children instanceof Array)){
            throw new Error("ASTList: children must be Array<ASTree>")
        }
        this._children = children;
    }

    child(idx){
        return this._children[idx];
    }

    numChildren(){
        return this._children.length;
    }

    children(){
        return this._children;
    }

    toString(){
        return `( ${this._children.map((val)=>{val.toString()}).join(" ")} )`
    }

    location(){
        //recursion
        for(let i=0 ;i< this._children.length ; i++){
            let lo = this._children[i].location();
            if(lo){
                return lo;
            }
        }

        return null;
    }
}

module.exports = ASTList;