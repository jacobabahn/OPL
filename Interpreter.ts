import { Visitor, Literal, Binary, Unary, Grouping, Expr } from "./Expr";
import { TokenType } from "./TokenType";
import Token from "./Token";

class Interpreter implements Visitor<any> {

    public visitLiteralExpr(expr: Literal): any {
        return expr.value
    }

    public visitGroupingExpr(expr: Grouping): any {
        return this.evaluate(expr.expression)
    }

    private evaluate = (expr: Expr): any => {
        return expr.accept(this)
    }

    public visitUnaryExpr(expr: Unary): any {
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

    private isEqual = (a: any, b: any): boolean => {
        if (a === null && b === null) return true
        if (a === null) return false

        return a.equals(b)
    }

    public visitBinaryExpr(expr: Binary): any {
        const left = this.evaluate(expr.left)
        const right = this.evaluate(expr.right)

        switch (expr.operator.type) {
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right)
                return left > right
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right)
                return left >= right
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right)
                return left < right
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right)
                return left <= right
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right)
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

    interpret = (expression: Expr): any => {
        try {
            let value = this.evaluate(expression)
            console.log(value)
        } catch (error) {
            console.log(error)
        }
    }

}

class RuntimeError extends Error {
    token: Token

    constructor(token: Token, message: string) {
        super(message)
        this.token = token
    }
}

export default Interpreter