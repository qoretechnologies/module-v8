//! V8 namespace
namespace V8 {
//! Program for embedding and executing JavaScript code
/**@par Restrictions:
    @ref Qore::PO_NO_EMBEDDED_LOGIC

*/
class JavaScriptProgram {

public:
//! Creates the object and parses and runs the given source code
/** @par Code Flags:
    @ref NAMED_ARGS

    @param source_code the JavaScript source to parse and compile
    @param source_label the label or file name of the source
*/
 constructor(string source_code, string source_label);

public:
//! Copies the object
/***/
 copy();

public:
//! Destroys the JavaScript program and invalidates the object
/***/
 destructor();

public:
//! Returns the global proxy object
/**@return the global proxy object
*/
JavaScriptObject getGlobal();

public:
//! Sets the "save reference" callback for %Qore data stored in JavaScript objects
/** @par Restrictions:
    @ref Qore::PO_NO_PROCESS_CONTROL

@par Code Flags:
    @ref NAMED_ARGS

    @par Example:
    @code{.q}
hash<auto> ref_cache;
code callback = sub (auto v) {
    # save reference to value in cache, so it doesn't go out of scope
    ref_cache{v.uniqueHash()} = v;
}
v8pgm.setSaveReferenceCallback(callback);
    @endcode

    @param save_reference_callback the callback to save any %Qore values stored in JavaScript code

    Due to the differences in garbage collection approaches between %Qore and JavaScript, %Qore objects must be
    managed with a deterministic life cycle; JavaScript objects have only weak references to %Qore values due to the
    lack of destructors in JavaScript and the lack of determinism in the JavaScript runtime for object lifecycle
    management.

    The callback set here will be called any time a %Qore reference is stored in a JavaScript object; if no callback is
    set, then the standard thread-local implementation is used where %Qore references are saved in a thread-local
    hash.

    @see @ref v8_qore_reference_lifecycle_management for more information
*/
 setSaveReferenceCallback(__7_ code save_reference_callback);

public:
//! Spins the event loop until all pending work for the program completes
/***/
int spinEventLoop();

public:
//! Pumps the event loop once, draining any ready I/O without blocking
/** This performs a single non-blocking pass of the embedded Node/libuv event loop (UV_RUN_NOWAIT): any I/O that
    is already complete is delivered, but the call does not wait for pending operations.  It deliberately does
    \b not run the loop to completion, as that would over-run and stall for the keep-alive idle timeout (~15s)
    when an upstream leaves its connection open after the response.  To run the loop until all pending work
    completes, use @ref spinEventLoop() instead.
*/
int spinOnce();
};
}
