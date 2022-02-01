import Token from "./token"
import { TokenType } from "./TokenType"

class Parser {
    private tokens: Token[]
    private current: number = 0

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    private Expression = () => {
        return this.equality()
    }

    private equality = () => {
        let expr = this.comparison()

        while (this.match('==') || this.match('!=')) {
            const operator = this.previous()
            expr = new Node(operator, expr, this.comparison())
        }

        return expr
    }

    private comparison = () => {
        let expr = this.term()

        while (this.match('<') || this.match('>') || this.match('<=') || this.match('>=')) {
            const operator = this.previous()
            let right = this.term()
            expr = new Node(expr, operator, right)
        }

        return expr
    }

    private term = () => {
        let expr = this.factor()

        while (this.match('-') || this.match('+')) {
            let operator = this.previous()
            let right = this.factor()
            expr = new Node(expr, operator, right)
        }

        return expr
    }

    private factor = () => {
        let expr = this.unary()

        if (this.match('*') || this.match('/')) {
            let operator = this.previous()
            let right = this.unary()
            expr = new Node(expr, operator, right)
        }

        return expr
    }

    private unary = () => {
        if (this.match('!') || this.match('-')) {
            let operator = this.previous()
            let right = this.unary()
            return new Node(operator, right)
        }

        return this.primary()
    }

    private primary = () => {
        if (this.match(TokenType.FALSE)) return new Node.literal(false)
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




}