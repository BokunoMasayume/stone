## BNF
BNF 与上下文无关文法等价
模式 | 说明
--|--
{ pattern } | 模式pattern至少重复0次
[ pattenr ] | 与重复出现0或1次的模式pattern匹配
pat1\|pat2 | 与pat1或pat2匹配
() | 将括号内视作一个完整的模式

### 四则运算BNF例子：
> factor: NUMBER | "(" expression ")" 

> term : factor { ("*" | "/") factor}

> experssion : term { ("+" | "-") term }

其中，非终结字符：`factor , term , experssion`，终结字符：`+-*/()`。

如果右侧的模式只含有终结符，BNF与正则表达式没有什么区别。此时，两者唯一的不同在于具体是以单词检查匹配还是以字符为单位检查匹配。

## stone 语法（BNF描述） 



