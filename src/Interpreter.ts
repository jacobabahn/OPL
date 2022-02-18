import { Visitor, Literal, Binary, Unary, Grouping, Ternary, Expr, Variable, Assign, Logical } from "./Expr";
import * as Stmt from "./Stmt";
import Environment from "./Environment";
import { TokenType } from "./TokenType";
import Token from "./Token";
import { runtimeError } from "./lox";
import { setMaxListeners } from "process";

class Interpreter implements Visitor<any>, Stmt.Visitor<void> {

    public visitLiteralExpr(expr: Literal) {
        return expr.value
    }

    public visitLogicalExpr(expr: Logical) {
        let left = this.evaluate(expr.left)

        if (expr.operator.type === TokenType.OR) {
            if (this.isTruthy(left)) return left
        } else {
            if (!this.isTruthy(left)) return left
        }

        return this.evaluate(expr.right)
    }

    public visitGroupingExpr(expr: Grouping) {
        return this.evaluate(expr.expression)
    }

    private evaluate = (expr: Expr): any => {
        return expr.accept(this)
    }

    private execute = (stmt: Stmt.Stmt): void => {
        stmt.accept(this)
    }

    executeBlock(statements: Stmt.Stmt[], environment: Environment) {
        let previous = this.environment
        try {
            this.environment = environment
            for (let statement of statements) {
                this.execute(statement)
            }
        } finally {
            this.environment = previous
        }
    }

    public visitBlockStmt(stmt: Stmt.Block) {
        this.executeBlock(stmt.statements, new Environment(this.environment))
        return null
    }

    public visitExpressionStmt(stmt: Stmt.Expression) {
        this.evaluate(stmt.expression)
        return null
    }

    public visitIfStmt(stmt: Stmt.If) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch)
        } else if (stmt.elseBranch) {
            this.execute(stmt.elseBranch)
        }
        return null
    }

    public visitPrintStmt(stmt: Stmt.Print) {
        let value = this.evaluate(stmt.expression)
        console.log(value)
        return null
    }

    public visitVarStmt(stmt: Stmt.Var) {
        let value = null
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer)
        }

        this.environment.define(stmt.name.lexeme, value)
        return null
    }

    public visitWhileStmt(stmt: Stmt.While) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body)
        }

        return null
    }
    
    public visitAssignExpr(expr: Assign) {
        let value = this.evaluate(expr.value)
        this.environment.assign(expr.name, value)
        return value
    }

    public visitUnaryExpr(expr: Unary) {
        const right = this.evaluate(expr.right)

        switch (expr.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right)
                return -right
            case TokenType.BANG:
                return !Boolean(right)
        }

        return null
    }

    public visitVariableExpr(expr: Variable) {
        return this.environment.get(expr.name)
    }

    public visitTernaryExpr(expr: Ternary) {
        const operator = this.evaluate(expr.condition)

        if (this.isTruthy(operator)) {
            return this.evaluate(expr.ifTrue)
        } else {
            return this.evaluate(expr.ifFalse)
        }

    }

    private checkNumberOperand = (operator: Token, operand: any): void => {
        if (typeof operand === 'number') return

        throw new RuntimeError(operator, "Operand must be a number.")
    }

    private isTruthy = (object: any): boolean => {
        if (object === null || object === undefined) {
            return false
        } 
        if (typeof object === 'boolean') {
            return Boolean(object)
        } 
        return true
    }

    private checkNumberOperands = (operator: Token, left: any, right: any): void => {
        if (typeof left === 'number' && typeof right === 'number') return

        throw new RuntimeError(operator, "Operands must be numbers.")
    }

    private checkType = (operator: Token, left: any, right: any): void => {
        if (typeof left === 'number' && typeof right === 'number') return
        if (typeof left === 'string' && typeof right === 'string') return

        throw new RuntimeError(operator, "Operands must be both numbers or strings.")
    }

    private isEqual = (a: any, b: any): boolean => {
        if (a === null && b === null) return true
        if (a === null) return false

        return a === (b)
    }

    public visitBinaryExpr(expr: Binary) {
        const left = this.evaluate(expr.left)
        const right = this.evaluate(expr.right)

        switch (expr.operator.type) {
            case TokenType.GREATER:
                this.checkType(expr.operator, left, right)
                return left > right
            case TokenType.GREATER_EQUAL:
                this.checkType(expr.operator, left, right)
                return left >= right
            case TokenType.LESS:
                this.checkType(expr.operator, left, right)
                return left < right
            case TokenType.LESS_EQUAL:
                this.checkType(expr.operator, left, right)
                return left <= right
            case TokenType.MINUS:
                this.checkType(expr.operator, left, right)
                return left - right
            case TokenType.PLUS:
                if (typeof left === 'number' && typeof right === 'number'){
                    return left + right
                }
                if (typeof left === 'string' && typeof right === 'string') {
                    return left + right
                }
                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.")
            case TokenType.SLASH: 
                this.checkNumberOperands(expr.operator, left, right)
                return left / right
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right)
                return left * right
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right)
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right)
        }

        return null
    }

    interpret = (statements: Stmt.Stmt[]) => {
        try {
            for (let statement of statements) {
                this.execute(statement)
            }
        } catch (error) {
            runtimeError(error)
        }
    }

    environment = new Environment()

}

class RuntimeError extends Error {
    token: Token

    constructor(token: Token, message: string) {
        super(message)
        this.token = token
    }
}

export { Interpreter, RuntimeError }