import Token from './Token';

class Environment {
    values: Map<string, any> = new Map();

    get(name: Token) {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme)
        }
        throw new Error(`Undefined variable '${name.lexeme}.'`)
    }

    assign(name: Token, value: Object): void {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value)
        }

        throw new Error(`Undefined variable '${name.lexeme}.'`)
    }

    define(name: string, value: Object): void {
        this.values.set(name, value)
    }
}

export default Environment;