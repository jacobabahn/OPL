import Lox from "./Lox"

class Scanner {
    private source: string
    private tokens: Token[] = []
    private start: number = 0
    private current: number = 0
    private line: number = 1

    constructor(source: string){
        this.source = source
    }

    scanTokens = (): Token[] => {
        while (!this.isAtEnd()) {
            this.start = this.current
            this.scanToken()
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line))
        return this.tokens
    }

    private scanToken = (): void => {
        // let lox = new Lox()
        const c: String = this.advance()
        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN)
                break
            case ')': this.addToken(TokenType.RIGHT_PAREN)
                break
            case '{': this.addToken(TokenType.LEFT_BRACE)
                break
            case '{': this.addToken(TokenType.RIGHT_BRACE)
                break
            case ',': this.addToken(TokenType.COMMA)
                break
            case '.': this.addToken(TokenType.DOT)
                break
            case '-': this.addToken(TokenType.MINUS)
                break
            case '+': this.addToken(TokenType.PLUS)
                break
            case ';': this.addToken(TokenType.SEMICOLON)
                break
            case '*': this.addToken(TokenType.STAR)
                break
            case '!': this.addToken(match('=') ? TokenType.BANG_EQUAL : TokenType.BANG)
                break
            case '=': this.addToken(match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL)
                break
            case '<': this.addToken(match('=') ? TokenType.LESS_EQUAL : TokenType.LESS)
                break
            case '>': this.addToken(match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER)
                break
            case '/':
                if (match('/')) {
                    while (peek() !== '\n' && !this.isAtEnd()) {
                        this.advance()
                    }} else {
                        this.addToken(TokenType.SLASH)
                    }
                    break
            case ' ':
            case '\r':
            case '\t':
                break
            case '\n':
                this.line++
                break
            case '"':
                this.string()
                breakS
            
            default:
                if (parseInt(c)) {
                    this.number()
                } else {
                    new Lox().error(this.line, "Unexpected character.") 
                }
                break
        }
    }

    private string = (): void => {
        while (peek() !== '"' && !this.isAtEnd()) {
            if (peek() === '\n') {
                this.line++
            }
            this.advance()
        }

        if (this.isAtEnd()) {
            new Lox().error(this.line, "Unterminated string.")
            return
        }

        this.advance()
        const value = this.source.slice(this.start + 1, this.current - 1)
        this.addToken(TokenType.STRING, value)
    }

    private match = (expected: string): boolean => {
        if (this.isAtEnd()) return false
        if (this.source[this.current] !== expected) return false

        this.current++
        return true
    }

    private peek = (): string => {
        if (this.isAtEnd()) return "\0"
        return this.source[this.current]
    }

    private isAtEnd = (): boolean => {
        return this.current >= this.source.length
    }

    private advance = (): string => {
        return this.source[this.current++]
    }

    private addToken = (type: TokenType, literal: Object = null): void => {
        const text: string = this.source.slice(this.start, this.current)
        this.tokens.push(new Token(type, text, literal, this.line))
    }

}

export default Scanner