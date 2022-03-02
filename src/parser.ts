import Token from "./Token"
import { TokenType } from "./TokenType"
import { Binary, Unary, Literal, Grouping, Ternary, Expr, Variable, Assign, Logical } from "./Expr"
import * as Stmt from "./Stmt"
import { errorToken } from "./lox"

class Parser {
    private tokens: Token[]
    private current: number = 0
    private allowExpr: boolean = false
    private foundExpr: boolean = false

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    parse = (): Stmt.Stmt[] => {
        let statements: Stmt.Stmt[] = []
        while (!this.isAtEnd()) {
            statements.push(this.declaration())
        }

        return statements
    }

    parseRepl = () => {
        this.allowExpr = true
        let statements: Stmt.Stmt[] = []
        while (!this.isAtEnd()) {
            statements.push(this.declaration())

            if (this.foundExpr) {
                let last = statements[statements.length - 1]
                return (last as Stmt.Expression).expression
            }

            this.allowExpr = false
        }

        return statements
    }

    private expression = (): Expr => {
        return this.assignment()
    }

    private declaration = (): Stmt.Stmt => {
        try {
            if (this.match([TokenType.VAR])) {
                return this.varDeclaration()
            }

            return this.statement()
        } catch(error) {
            this.synchronize()
            return new Stmt.Expression(new Literal(null))
        }
    }

    private statement = (): Stmt.Stmt => {
        if (this.match([TokenType.FOR])) {
            return this.forStatement()
        } else if (this.match([TokenType.IF])) {
            return this.ifStatement()
        } else if (this.match([TokenType.PRINT])) {
            return this.printStatement()
        } else if (this.match([TokenType.WHILE])) {
            return this.whileStatement()
        } else if (this.match([TokenType.LEFT_BRACE])) {
            return new Stmt.Block(this.block())
        } else if (this.match([TokenType.EXIT])) {
            process.exit()
        }

        return this.expressionStatement()
    }

    private forStatement = (): Stmt.Stmt => {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.")

        let initializer: Stmt.Stmt | null = null
        if (this.match([TokenType.SEMICOLON])) {
            initializer = null
        } else if (this.match([TokenType.VAR])) {
            initializer = this.varDeclaration()
        } else {
            initializer = this.expressionStatement()
        }

        let condition: Expr | null = null
        if (!this.check(TokenType.SEMICOLON)) {
            condition = this.expression()
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.")

        let increment: Expr | null = null
        if (!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression()
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.")

        let body = this.statement()

        if (increment) {
            body = new Stmt.Block([
                body,
                new Stmt.Expression(increment)
            ])
        }
        if (!condition) {
            condition = new Literal(true)
        }
        
        body = new Stmt.While(condition, body)

        if (initializer) {
            body = new Stmt.Block([initializer, body])
        }

        return body
    }

    private ifStatement = (): Stmt.Stmt => {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.")
        let condition = this.expression()
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.")

        let thenBranch = this.statement()
        let elseBranch = null as any
        if (this.match([TokenType.ELSE])) {
            elseBranch = this.statement()
        }

        return new Stmt.If(condition, thenBranch, elseBranch)
    }

    private printStatement = (): Stmt.Stmt => {
        const value = this.expression()
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.")
        return new Stmt.Print(value)
    }

    private varDeclaration = (): Stmt.Stmt => {
        let name = this.consume(TokenType.IDENTIFIER, "Expect variable name.")

        let initializer: Expr = new Literal(null)
        if (this.match([TokenType.EQUAL])) {
            initializer = this.expression()
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.")
        return new Stmt.Var(name, initializer)
    }

    private whileStatement = (): Stmt.Stmt => {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.")
        let condition = this.expression()
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.")
        let body = this.statement()

        return new Stmt.While(condition, body)
    }

    private expressionStatement = (): Stmt.Stmt => {
        let expr = this.expression()

        if (this.allowExpr && this.isAtEnd()) {
            this.foundExpr = true
        } else {
            this.consume(TokenType.SEMICOLON, "Expect ';' after expression.")
        }

        return new Stmt.Expression(expr)
    }

    private block = (): Stmt.Stmt[] => {
        let statements: Stmt.Stmt[] = []

        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration())
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.")
        return statements
    }

    private assignment = (): Expr => {
        let expr = this.or()

        if (this.match([TokenType.EQUAL])) {
            let equals = this.previous()
            let value = this.assignment()

            if (expr instanceof Variable) {
                let name = expr.name
                return new Assign(name, value)
            }

            this.error(equals, "Invalid assignment target.")
        }

        return expr
    }

    private or = (): Expr => {
        let expr = this.and()

        while (this.match([TokenType.OR])) {
            let operator = this.previous()
            let right = this.and()
            expr = new Logical(expr, operator, right)
        }

        return expr
    }

    private and = (): Expr => {
        let expr = this.equality()

        while (this.match([TokenType.AND])) {
            let operator = this.previous()
            let right = this.equality()
            expr = new Logical(expr, operator, right)
        }

        return expr
    }

    private ternary = (): Expr => {
        let value = this.equality()

        if (this.match([TokenType.QUESTION])) {
            let left = this.ternary()
            if (this.match([TokenType.COLON])) {
                let right = this.ternary()
                return new Ternary(value, left, right)
            } else {
                throw this.error(this.peek(), "Expect '?' to have matching ':'.")
            }
        }

        return value
    }

    private equality = (): Expr => {
        let expr = this.comparison()

        while (this.match([TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL])) {
            const operator = this.previous()
            expr = new Binary(expr, operator, this.comparison())
        }

        return expr
    }

    private comparison = (): Expr => {
        let expr = this.term()

        while (this.match([TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL])) {
            const operator = this.previous()
            let right = this.term()
            expr = new Binary(expr, operator, right)
        }

        return expr
    }

    private term = (): Expr => {
        let expr = this.factor()

        while (this.match([TokenType.PLUS, TokenType.MINUS])) {
            let operator = this.previous()
            let right = this.factor()
            expr = new Binary(expr, operator, right)
        }

        return expr
    }

    private factor = (): Expr => {
        let expr = this.unary()

        while (this.match([TokenType.SLASH, TokenType.STAR])) {
            let operator = this.previous()
            let right = this.unary()
            expr = new Binary(expr, operator, right)
        }

        return expr
    }

    private unary = (): Expr => {
        while (this.match([TokenType.BANG, TokenType.MINUS])) {
            let operator = this.previous()
            let right = this.unary()
            return new Unary(operator, right)
        }

        return this.primary()
    }

    private primary = () => {
        if (this.match([TokenType.FALSE])) return new Literal(false)
        if (this.match([TokenType.TRUE])) return new Literal(true)
        if (this.match([TokenType.NIL])) return new Literal(null)

        if (this.match([TokenType.NUMBER, TokenType.STRING])) {
            return new Literal(this.previous().literal)
        }

        if (this.match([TokenType.IDENTIFIER])) {
            return new Variable(this.previous())
        }

        if (this.match([TokenType.LEFT_PAREN])) {
            let expr = this.expression()
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
            return new Grouping(expr)
        }

        throw this.error(this.peek(), "Expect expression.")
    }

    private match = (types: TokenType[]): boolean => {
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

    private check = (type: any): boolean => {
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
}

class ParseError extends Error {}

export default Parser