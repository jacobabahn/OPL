import Token from "./token"
import { TokenType } from "./TokenType"
import { Binary, Unary, Literal, Grouping, Expr } from "./Expr"
import { errorToken } from "./TSLox"

class Parser {
    private tokens: Token[]
    private current: number = 0

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    parse = (): Expr => {
        try {
            return this.expression()
        } catch (error) {
            return null
        }
    }

    private expression = (): Expr => {
        return this.equality()
    }

    private equality = (): Expr => {
        let expr = this.comparison()

        while (this.match('==') || this.match('!=')) {
            const operator = this.previous()
            expr = new Binary(expr, operator, this.comparison())
        }

        return expr
    }

    private comparison = (): Expr => {
        let expr = this.term()

        while (this.match('<') || this.match('>') || this.match('<=') || this.match('>=')) {
            const operator = this.previous()
            let right = this.term()
            expr = new Binary(expr, operator, right)
        }

        return expr
    }

    private term = (): Expr => {
        let expr = this.factor()

        while (this.match('-') || this.match('+')) {
            let operator = this.previous()
            let right = this.factor()
            expr = new Binary(expr, operator, right)
        }

        return expr
    }

    private factor = (): Expr => {
        let expr = this.unary()

        if (this.match('*') || this.match('/')) {
            let operator = this.previous()
            let right = this.unary()
            expr = new Binary(expr, operator, right)
        }

        return expr
    }

    private unary = (): Expr => {
        if (this.match('!') || this.match('-')) {
            let operator = this.previous()
            let right = this.unary()
            return new Unary(operator, right)
        }

        return this.primary()
    }

    private primary = () => {
        if (this.match(TokenType.FALSE)) return new Literal(false)
        if (this.match(TokenType.TRUE)) return new Literal(true)
        if (this.match(TokenType.NIL)) return new Literal(null)

        if (this.match(TokenType.NUMBER) || this.match(TokenType.STRING)) {
            return new Literal(this.previous().literal)
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            let expr = this.expression()
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
            return new Grouping(expr)
        }

        throw this.error(this.peek(), "Expect expression.")
    }

    private match = (types): boolean => {
        for (const type of types) {
            if (this.check(type)) {
                this.advance()
                return true
            }
        }

        return false
    }

    private consume = (type: TokenType, message: string) => {
        if (this.check(type)) return this.advance()
        throw this.error(this.peek(), message)
    }

    private check = (type): boolean => {
        if (this.isAtEnd()) {
            return false
        }

        return this.peek().type === type
    }

    private advance = (): Token => {
        if (!this.isAtEnd()) {
            this.current++
        }

        return this.previous()
    }

    private isAtEnd = (): boolean => {
        return this.peek().type === TokenType.EOF
    }

    private peek = (): Token => {
        return this.tokens[this.current]
    }

    private previous = (): Token => {
        return this.tokens[this.current - 1]
    }

    private error = (token: Token, message: string): any => {
        // let instance = new Lox()
        // instance.errorToken(token, message)
        // return new ParseError()

        errorToken(token, message)
        return new ParseError()
    }

    private synchronize = (): void => {
        this.advance()

        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.SEMICOLON) return

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN: return;
            }

            this.advance()
        }
    }

    // static parseError = class ParseError{
    //     constructor() {
    //         throw new Error("ParseError")
    //     }
    // }
}

class ParseError extends Error {}

export default Parser