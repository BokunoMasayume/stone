# content
- [note](#note)
    - [BNF](##BNF)
    - [stone语法](##stone语法（BNF描述）)
- [log](#log)

# note

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

## stone语法（BNF描述） 

primary: "(" expr ")" | NUMBER | IDENTIFIER | STRING

factor : "-" primary | primary

expr: factor { OP factor }

block : "{" [ statement ] { ( ";" | EOL ) [ statement ] } "}"

simple: expr

statement : simple | "while" expr block | "if" expr block ["else" block]

program : [ statement ] (";"|EOL)

> 其中,program是一条语句（带有句号，即分号或换行），statement是一条语句（拿掉句号的部分），simple是简单语句，即一条表达式，block是一个语句块，expr是表达式，factor是表达式的因子，primary是表达式的因子（数字字符串字面量，标识符和子表达式）



# log 




