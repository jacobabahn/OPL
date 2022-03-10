import Token from "./Token"
import { Expr } from "./Expr"

export interface Visitor<R> {
    visitBlockStmt(stmt: Block): R
    visitBreakStmt(stmt: Break): R
    visitContinueStmt(stmt: Continue): R
    visitExitStmt(stmt: Exit): R
    visitExpressionStmt(stmt: Expression): R
    visitIfStmt(stmt: If): R
    visitPrintStmt(stmt: Print): R
    visitVarStmt(stmt: Var): R
    visitWhileStmt(stmt: While): R
    visitSwitchStmt(stmt: Switch): R
    visitCaseStmt(stmt: Case): R
}

export abstract class Stmt {
    abstract accept<R>(visitor: Visitor<R>): R
}

export class Block extends Stmt {
    readonly statements: Stmt[]

    constructor(statements: Stmt[]) {
        super()
        this.statements = statements
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitBlockStmt(this)
    }
}

export class Break extends Stmt {

    constructor() {
        super()
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitBreakStmt(this)
    }
}

export class Continue extends Stmt {

    constructor() {
        super()
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitContinueStmt(this)
    }
}

export class Exit extends Stmt {

    constructor() {
        super()
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitExitStmt(this)
    }
}

export class Expression extends Stmt {
    readonly expression: Expr

    constructor(expression: Expr) {
        super()
        this.expression = expression
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitExpressionStmt(this)
    }
}

export class If extends Stmt {
    readonly condition: Expr
    readonly thenBranch: Stmt
    readonly elseBranch: Stmt

    constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt) {
        super()
        this.condition = condition
        this.thenBranch = thenBranch
        this.elseBranch = elseBranch
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitIfStmt(this)
    }
}

export class Print extends Stmt {
    readonly expression: Expr

    constructor(expression: Expr) {
        super()
        this.expression = expression
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitPrintStmt(this)
    }
}

export class Var extends Stmt {
    readonly name: Token
    readonly initializer: Expr

    constructor(name: Token, initializer: Expr) {
        super()
        this.name = name
        this.initializer = initializer
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitVarStmt(this)
    }
}

export class While extends Stmt {
    readonly condition: Expr
    readonly body: Stmt
    readonly isWhile: boolean

    constructor(condition: Expr, body: Stmt, isWhile: boolean) {
        super()
        this.condition = condition
        this.body = body
        this.isWhile = isWhile
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitWhileStmt(this)
    }
}

export class Switch extends Stmt {
    readonly condition: Expr
    readonly cases: Case[]
    readonly defaultCase: Stmt

    constructor(condition: Expr, cases: Case[], defaultCase: Stmt) {
        super()
        this.condition = condition
        this.cases = cases
        this.defaultCase = defaultCase
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitSwitchStmt(this)
    }
}

export class Case extends Stmt {
    readonly condition: Expr
    readonly body: Stmt

    constructor(condition: Expr, body: Stmt) {
        super()
        this.condition = condition
        this.body = body
    }

    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visitCaseStmt(this)
    }
}