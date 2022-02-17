import Token from "./Token"

export interface Visitor<R> {
    visitAssignExpr(expr: Assign): R
    visitBinaryExpr(expr: Binary): R
    visitGroupingExpr(expr: Grouping): R
    visitLiteralExpr(expr: Literal): R
    visitUnaryExpr(expr: Unary): R
    visitTernaryExpr(expr: Ternary): R
    visitVariableExpr(expr: Variable): R
}

export abstract class Expr {
    abstract accept<R>(visitor: Visitor<R>): R
}

export class Assign extends Expr {
    readonly name: Token
    readonly value: Expr

    constructor(name: Token, value: Expr) {
        super()
        this.name = name
        this.value = value
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitAssignExpr(this)
    }
}

export class Binary extends Expr {
    readonly left: Expr
    readonly operator: Token
    readonly right: Expr

    constructor(left: Expr, operator: Token, right: Expr) {
        super()
        this.left = left
        this.operator = operator
        this.right = right
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitBinaryExpr(this)
    }
}

export class Grouping extends Expr {
    readonly expression: Expr

    constructor(expression: Expr) {
        super()
        this.expression = expression
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitGroupingExpr(this)
    }
}

export class Literal extends Expr {
    readonly value: unknown

    constructor(value: unknown) {
        super()
        this.value = value
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitLiteralExpr(this)
    }
}

export class Unary extends Expr {
    readonly operator: Token
    readonly right: Expr

    constructor(operator: Token, right: Expr) {
        super()
        this.operator = operator
        this.right = right
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitUnaryExpr(this)
    }
}

export class Ternary extends Expr {
    readonly condition: Expr
    readonly ifTrue: Expr
    readonly ifFalse: Expr

    constructor(condition: Expr, ifTrue: Expr, ifFalse: Expr) {
        super()
        this.condition = condition
        this.ifTrue = ifTrue
        this.ifFalse = ifFalse
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitTernaryExpr(this)
    }
}

export class Variable extends Expr {
    readonly name: Token

    constructor(name: Token) {
        super()
        this.name = name
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitVariableExpr(this)
    }
}