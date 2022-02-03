import { readFileSync } from 'fs';
import Scanner from "./Scanner";
import Token from './Token';
import { TokenType } from "./TokenType";
import Parser from './parser';
import AstPrinter from './AstPrinter';
import RpnPrinter from './RpnPrinter';
import Interpreter from './Interpreter';
import { argv } from 'process';

const interpreter = new Interpreter()
let hadError: boolean = false
let hadRuntimeError = false
let rpn = false

const main = (args: string[]): void => {
    if (args[0] === "--rpn") {
        rpn = true
    }

    if (args.length > 1) {
        console.log("Usage: jlox [script]")
        process.exit(64)
    }
    else if (args.length === 1) {
        runFile(args[0])
    } else {
        runPrompt()
    }
}

const runFile = (path: string): void => {
    const file = readFileSync(path, { encoding: "utf8" })
    run(file)

    if (hadError)
        process.exit(65)

    if (hadRuntimeError)
        process.exit(70)
}

const runPrompt = (): void => {
    const readline = require("readline")

    const line = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const promptLoop = () => {
        line.question("> ", (response: string) => {
            if (response === null) {
                process.exit(1)
            }

            run(response)

            if (hadError)
                process.exit(65)
            
            promptLoop()
        })
    }

    promptLoop()
}

const run = (source: string) => {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()

    const parser = new Parser(tokens)
    const expression = parser.parse()

    if (hadError) 
        return
    if (rpn) {
        console.log(new RpnPrinter().printExpr(expression))
    } else {
        interpreter.interpret(expression)
    }
}

const error = (line: number, message: string): void => {
    report(line, "", message)
}

const runtimeError = (error: any): void => {
    console.log(`${error.message} \n[line ${error.token.line}]`)
    hadRuntimeError = true
}

const errorToken = (token: Token, message: string): any => {
    if (token.type === TokenType.EOF) {
        report(token.line, " at end", message)
    } else {
        report(token.line, ` at '${token.lexeme}'`, message)
    }
}

const report = (line: number, where: string, message: string): void => {
    console.log(`[line ${line}] Error${where}: ${message}`)
    hadError = true
}

main(argv.slice(2))

export { errorToken, error }