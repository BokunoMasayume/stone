class ASTree {

    constructor(){

    }

    /**
     * 
     * @param {number} idx - get the idx-th child 
     * @return ASTree
     */
    child(idx){
        return null
    }

    /**
     * the number of children
     * @returns number
     */
    numChildren(){
        return 0;
    }

    /**
     * @returns children Array / iterator
     */
    children(){
        return [];
    }

    /**
     * @returns string ???
     */
    location(){}
}

module.exports = ASTree;