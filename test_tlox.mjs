import * as child_process from 'child_process';
// Testing that expressions are parsed and interpreted correctly.
var general_tests = [
    'General tests                                      ; ',
    '(15/5) * (3 + 4) - (2 + 3) * (4 - 3) / (5 - 3)     ; 18.5',
    '15 * 3 + 4 * 5                                     ; 65',
    '15 * 3 + 4 * 5 / 2                                 ; 55',
    '(15 * 3 + 4 * 5 / 2 - 3                            ; [line 1] Error at end: Expect \')\' after expression.',
    '"cat" + "dog"                                      ; catdog',
    '"cat" > 5                                          ; Operands must be both numbers or both strings.\n[line 1]',
    '-"cat"                                             ; Operand must be a number.\n[line 1]',
    '!"cat"                                             ; Operand must be a number.\n[line 1]', // or false... which should this be? 
]
var rpn_tests = [
    "RPN Tests                                          ;'--rpn'",
    "1 + 2 + 3                                          ; 1 2 + 3 +",
    "1 + 2 * 3                                          ; 1 2 3 * +",
    "1 + 2 * 3 + 4                                      ; 1 2 3 * + 4 +",
    "(15 + 5) / 2                                       ; 15 5 + 2 /",
    "!15                                                ; 15 not",
    "!(15 + 5)                                          ; 15 5 + not",
    "-(15 + 5) / 2                                      ; 15 5 + neg 2 /",
    "15 + 5 - -(15 + 5) / 2                             ; 15 5 + 15 5 + neg 2 / -",
]
var ternary_tests = [
    'Ternary Tests                                      ; ',
    'true ? 1 : 2                                       ; 1',
    'false ? 1 : 2                                      ; 2',
    'true ? 1 : 2 + 3                                   ; 1',
    '!true ? 1 : 2 + 3                                  ; 5',
    'true ? false ? 15 : \"cat\" : 3                    ; cat',
    'false ? true ? 15 : \"cat\" : 3 + 4                ; 7',
    'true ? true ? true ? true : 15 : 14 : 13           ; true',
    '0 ? 1 : 2                                          ; 1',
    '\"cat\" ? 1 : 2                                    ; 1',
    '\"\" ? 1 : 2 + 3                                   ; 1',
    'nil ? 1 : 2 + 3                                    ; 5',
    'nil ? nil ? 1 : 2 + 3 : 4                          ; 4',
    'true ? 15                                          ; [line 1] Error at end: Expect \'?\' to have matching \':\'.',                              
]
var string_comparison_tests = [
    'String Comparison Tests                            ; ',
    '"cat" == "cat"                                     ; true',
    '"cat" == "dog"                                     ; false',
    '"cat" != "cat"                                     ; false',
    '"cat" != "dog"                                     ; true',
    '"cat" < "dog"                                      ; true',
    '"cat" < "cat"                                      ; false',
    '"cat" > "dog"                                      ; false',
    '"cat" > "cat"                                      ; false',
    '"cat" <= "dog"                                     ; true',
    '"cat" <= "cat"                                     ; true',
    '"cat" >= "dog"                                     ; false',
    '"cat" >= "cat"                                     ; true',
    '"Cat" == "cat"                                     ; false',
    '"Cat" > "cat"                                      ; false',
    '"Cat" < "cat"                                      ; true',
    '"xyz" >= "abc"                                     ; true',
]

const runTests = async (arg, testArray) => {
    return new Promise((resolve, reject) => {

        var testId = 1 // start at 1 due to the metadata within each array of tests
        let interpreter = child_process.spawn('../tlox', [arg]);
        let passed = 0
        let failed = 0

        //standard output
        interpreter.stdout.on('data', (data) => {
            let output = data.toString()
            let testString = testArray[testId]
            console.log(testString)
            let expected = testString.split(';')[1]

            if (output.trim() === expected.trim()) {
                console.log('\x1b[32m%s\x1b[0m', 'PASS\n')
                passed++
            } else {
                console.log('\x1b[31m%s\x1b[0m', 'FAIL')
                console.log('\x1b[31m%s\x1b[0m', 'Expected: ' + expected)
                console.log('\x1b[31m%s\x1b[0m', 'Actual: ' + output + '\n')
                failed++
            }

            testId++
            if (testId < testArray.length) {
                runTest(testArray)
            } else {
                interpreter.kill()
                resolve([passed, failed])
            }
        });

        // error output
        interpreter.stderr.setEncoding('utf8');
        interpreter.stderr.on('data', function (data) {
            // Don't do anything with the error output.
            //console.log('stderr: ' + data);
        });


        //input
        interpreter.stdin.setDefaultEncoding('utf8')
        const runTest = (tests) => {
            let testString = tests[testId]
            let input = testString.split(';')[0].trim()
            interpreter.stdin.write(input + '\n')
        }
        runTest(testArray)
    })
}

const main = async () => {
    let to_run = [general_tests, rpn_tests, ternary_tests, string_comparison_tests]
    let passed = 0
    let failed = 0

    for (let i = 0; i < to_run.length; i++) {
        let testArray = to_run[i]
        let name = testArray[0].split(';')[0].trim()
        let arg = testArray[0].split(';')[1].trim()
        console.log(`Running ${name}`)
        await runTests(arg, testArray).then((results) => {
            passed += results[0]
            failed += results[1]
            console.log('\x1b[32m%s\x1b[0m', `${name} passed: ` + results[0])
            console.log('\x1b[31m%s\x1b[0m', `${name} failed: ` + results[1])
        })
    }

    console.log('\n\n')
    console.log('\x1b[32m%s\x1b[0m', 'Total passed: ' + passed)
    console.log('\x1b[31m%s\x1b[0m', 'Total failed: ' + failed)

    if (failed == 0) {
        console.log('\x1b[32m%s\x1b[0m', 'All tests passed!')
    }

    process.exit(0)
}

main()