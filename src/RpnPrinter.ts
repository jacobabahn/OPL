import * as Expr from './Expr';

class RpnPrinter implements Expr.Visitor<string> {
    printExpr(expr: Expr.Expr): string {
        return expr.accept(this)
    }

    visitBinaryExpr(expr: Expr.Binary): string {
        return this.rpnPrint(`${expr.left.accept(this)} ${expr.right.accept(this)} ${expr.operator.lexeme}`)
    }

    visitGroupingExpr(expr: Expr.Grouping): string {
        return this.rpnPrint("", expr.expression)
    }

    visitLiteralExpr(expr: Expr.Literal): string {
        if (expr.value == null) 
            return "nil"
        return String(expr.value)
    }

    visitUnaryExpr(expr: Expr.Unary): string {
        if (expr.operator.lexeme === "!") {
            return this.rpnPrint(`${expr.right.accept(this)} not`)
        } else if (expr.operator.lexeme === "-") {
            return this.rpnPrint(`${expr.right.accept(this)} neg`)
        } else {
            return this.rpnPrint(expr.operator.lexeme, expr.right)
        }
    }

    visitTernaryExpr(expr: Expr.Ternary): string {
        return this.rpnPrint(`${expr.operator.accept(this)} ${expr.ifTrue.accept(this)} ${expr.ifFalse.accept(this)}`)
    }

    private rpnPrint(name: string, ...expressions: Expr.Expr[]) {
        let output = ""
        for (const expression of expressions) {
            output += `${expression.accept(this)}`
        }
        output += `${name}`


        return output
    }
}

export default RpnPrinter