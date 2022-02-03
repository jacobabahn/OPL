import { TokenType } from "./TokenType";
class Token {
    type: TokenType;
    lexeme: string;
    literal: unknown;
    line: number;

    constructor(type: TokenType, lexeme: string, literal: unknown, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString = (): string => {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}

export default Token