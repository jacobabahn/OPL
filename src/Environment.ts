import Token from './Token';

class Environment {
    values: { [key: string]: any } = {}

    get(name: Token) {
        if (name.lexeme in this.values) {
            return this.values[name.lexeme]
        }

        throw new Error(`Undefined variable '${name.lexeme}.'`)
    }

    assign(name: Token, value: Object): void {
        if (name.lexeme in this.values) {
            this.values[name.lexeme] = value
            return
        }

        throw new Error(`Undefined variable '${name.lexeme}.'`)
    }

    define(name: string, value: Object): void {
        this.values[name] = value
    }
}

export default Environment;