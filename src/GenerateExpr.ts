import { argv } from 'process'
import { writeFileSync } from 'fs'
import Colors from '../src/colors'

const dependencies = [
    'import Token from "./Token"',
]

const expTypes = [
    "Assign   : name: Token, value: Expr",
    "Binary   : left: Expr, operator: Token, right: Expr",
    "Grouping : expression: Expr",
    "Literal  : value: unknown",
    "Logical  : left: Expr, operator: Token, right: Expr",
    "Unary    : operator: Token, right: Expr",
    "Ternary  : condition: Expr, ifTrue: Expr, ifFalse: Expr",
    "Variable : name: Token",
]

const stmtTypes = [
    "Block      : statements: Stmt[]",
    "Expression : expression: Expr",
    "If         : condition: Expr, thenBranch: Stmt, elseBranch: Stmt",
    "Print      : expression: Expr",
    "Var        : name: Token, initializer: Expr",
    "While      : condition: Expr, body: Stmt",
]

const defineType = (baseName: string, className: string, fields: string): string => {
    let output: string = ''

    //Define the class
    output += `export class ${ className } extends ${ baseName } {\n`

    //Generate the members of the class
    const fieldArr: string[] = fields.split(',')
    fieldArr.forEach(field => {
        const name: string = field.trim().substring(0, field.trim().indexOf(':'))
        const type = field.trim().split(' ')[1]
        output += `    readonly ${ name }: ${ type }\n`
    })

    //Generate the constructor for the class
    output += `\n    constructor(${ fields }) {\n        super()\n`
    fieldArr.forEach(field => {
        const name = field.trim().substring(0, field.trim().indexOf(':'))
        output += `        this.${ name } = ${ name }\n`
    })
    output += '    }\n\n'

    output += `    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visit${ className + baseName }(this)
    }`

    output += '\n}\n\n'

    return output
}

const defineVisitor = (baseName: string, types: string[]) => {
    let output: string = `export interface Visitor<R> {\n`
    
    for (const type of types) {
        const className = type.split(':')[0].trim()
        output += `    visit${ className + baseName }(${ baseName.toLocaleLowerCase() }: ${ className }): R\n`
    }
    output += '}\n\n'

    return output
}

const defineAst = (path: string, baseName: string, types: string[], expPath?: string) => {
    let output: string = ''

    //Add in dependencies
    output += dependencies.join('\n')

    if (expPath) {
        output += `\nimport { Expr } from "./${ expPath.split('/').pop()?.split('.')[0] }"`
    }

    //Generate the visitor interfaces
    output += `\n\n${ defineVisitor(baseName, types) }`

    //Generate the base abstract class
    output += `export abstract class ${ baseName } {\n    abstract accept<R>(visitor: Visitor<R>): R\n}\n\n`

    for (const type of types) {
        const className = type.split(':')[0].trim()
        const fields = type.substring(type.indexOf(':') + 1).trim()
        output += defineType(baseName, className, fields)
    }

    writeFileSync(path, output.trim(), { flag: 'w' })
}

const main = (): void => {
    const args = argv.slice(2)

    if (args.length !== 2) {
        console.log(`
            ${ Colors.RED }Incorrect arguments.${ Colors.RESET }
            \n
            Usage: expgen [exprPath] [stmtPath]
        `)
        return
    }

    defineAst(args[0], 'Expr', expTypes)
    defineAst(args[1], 'Stmt', stmtTypes, args[0])
}

main()