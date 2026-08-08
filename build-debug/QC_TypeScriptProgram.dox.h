//! V8 namespace
namespace V8 {
//! Program for embedding and executing TypeScript code with runtime transpilation to JavaScript
/**@par Restrictions:
    @ref Qore::PO_NO_EMBEDDED_LOGIC

TypeScript source code is transpiled to JavaScript using Node.js's built-in
    \c stripTypeScriptTypes() API (requires Node.js 24+) before execution. The transpilation
    uses \c transform mode, which handles type stripping, enums, and namespace transformation.

    All methods from @ref JavaScriptProgram are inherited and work identically.
*/
class TypeScriptProgram : public JavaScriptProgram {

public:
//! Creates the object, transpiles the TypeScript source to JavaScript, and executes it
/** @par Code Flags:
    @ref NAMED_ARGS

    @param source_code the TypeScript source to transpile and execute
    @param source_label the label or file name of the source

    @throw JAVASCRIPT-PROGRAM-ERROR error initializing the program
    @throw JAVASCRIPT-EXCEPTION error in the TypeScript source code (syntax error, etc.)
*/
 constructor(string source_code, string source_label);

public:
//! Copies the object
/***/
 copy();

public:
//! Destroys the TypeScript program and invalidates the object
/***/
 destructor();
};
}
