import Token from './Token'
import { RuntimeError } from './Interpreter'

class Environment {
    values: Map<string, any>
    enclosing: Environment | null

    constructor(enclosing?: Environment) {
        this.values = new Map()
        this.enclosing = enclosing ? enclosing : null
    }

    get(name: Token): any {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme)
        }

        if (this.enclosing) {
            return this.enclosing.get(name)
        }

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}.'`)
    }

    assign(name: Token, value: Object): void {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value)
            return
        }

        if (this.enclosing) {
            this.enclosing.assign(name, value)
            return
        }

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}.'`)
    }

    define(name: string, value: Object): void {
        this.values.set(name, value)
    }
}

export default Environment;