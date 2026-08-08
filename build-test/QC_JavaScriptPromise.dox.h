//! V8 namespace
namespace V8 {
//! Promise for embedding and executing JavaScript code
/***/
class JavaScriptPromise : public JavaScriptObject {

public:
//! Runs the given code asynchronously if the Promise throws an asynchronous error
/** @param catch_code the code to run if the Promise throws an asynchronous error
*/
JavaScriptPromise doCatch(code catch_code);

public:
//! Returns the result of the promise
/** @return the result of the promise

    @throw PROMISE-PENDING The Promise has not yet been resolved
*/
auto getResult();

public:
//! Returns the state of the Promise
/** @return the state of the Promise'; see @ref promise_states for possible values
*/
int getState();

public:
//! Returns @ref True if the Promise has a handler
/** @return @ref True if the Promise has a handler
*/
bool hasHandler();

public:
//! Returns the value of the given JavaScript promise property
/** @param m the property name

    @return the value of the property
*/
auto memberGate(string m);

public:
//! Calls the JavaScript method and returns the response
/** @param m the method name
    @param ... any argument to the method

    @return the response from the JavaScript method
*/
auto methodGate(string m,  ...);

public:
//! Runs the given code asynchronously when the Promise resolves
/** @param then_code the code to run when the Promise resolves, the value of the Promise is used as the argument to
    the code
    @param reject_code the code to run if the Promise is rejected
*/
JavaScriptPromise then(code then_code, __7_ code reject_code);

public:
//! Waits for the promise to resolve
/** This also ensures that any background I/O is executed by spinning the UV event loop while waiting for the Promise
    to resolve
*/
 wait();
};
/** @defgroup promise_states Promise States
*/
///@{

//! for fulfilled Promises
    const Fulfilled = qore(QoreValue(v8::Promise::PromiseState::kFulfilled));
//! for pending Promises
    const Pending = qore(QoreValue(v8::Promise::PromiseState::kPending));
//! for rejected Promises
    const Rejected = qore(QoreValue(v8::Promise::PromiseState::kRejected));
///@}
}
