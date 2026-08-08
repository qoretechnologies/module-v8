//! V8 namespace
namespace V8 {
//! Program for embedding and executing JavaScript code
/**@par Restrictions:
    @ref Qore::PO_NO_EMBEDDED_LOGIC

*/
class JavaScriptProgram {

public:
//! Creates the object and parses and runs the given source code
/** @param source_code the JavaScript source to parse and compile
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

    @par Example:
    @code{.py}
hash<auto> ref_cache;
code callback = sub (auto v) {
    # save reference to value in cache, so it doesn't go out of scope
    object_cache{v.uniqueHash()} = v;
}
v8pgm.setSaveReferenceCallback(callback);
    @endcode

    @param save_ref_callback the callback to save any %Qore values stored in Python code

    Due to the differences in garbage collection approaches between %Qore and JavaScript, %Qore objects must be
    managed with a deterministic life cycle; JavaScript objects have only weak references to %Qore values due to the
    lack of destructors in JavaScript and the lack of determinism in the JavaScript runtime for object lifecycle
    management.

    The callback set here will be called any time a %Qore reference is stored in a Python object; if no callback is
    set, then the standard thread-local implementation is used where %Qore references are saved in a thread-local
    hash.

    @see @ref v8_qore_reference_lifecycle_management for more information
*/
 setSaveReferenceCallback(__7_ code save_ref_callback);

public:
//! Spins the event loop the program
/***/
int spinEventLoop();

public:
//! Spins the event loop once for the program
/***/
int spinOnce();
};
}
