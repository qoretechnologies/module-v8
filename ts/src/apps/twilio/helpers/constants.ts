import Twilio, { Twilio as TwilioType } from 'twilio';

const formatResponse = (response: any) => {
  return JSON.parse(JSON.stringify(response));
};

export const createTwilioClient = (accountSid: string, token: string): TwilioType => {
  const client = Twilio(accountSid, token, { autoRetry: true, maxRetries: 3 });

  const proxyCache = new WeakMap();

  const createProxy = (target: any): any => {
    // Return cached proxy if we've already wrapped this object
    if (proxyCache.has(target)) {
      return proxyCache.get(target);
    }

    const proxy = new Proxy(target, {
      get(target, prop) {
        // Use Reflect.get to properly handle prototype chain and getters
        const orig = Reflect.get(target, prop, target);

        if (orig === undefined || orig === null) {
          return orig;
        }

        // Handle functions that may also have properties (like client.calls)
        if (typeof orig === 'function') {
          // Check if this function has custom properties (Twilio pattern)
          const ownProps = Object.getOwnPropertyNames(orig);
          const hasCustomProps = ownProps.some(
            (p) => !['length', 'name', 'arguments', 'caller', 'prototype'].includes(p)
          );

          if (hasCustomProps) {
            // This is a function with properties (like client.calls)
            // Proxy it to handle both function calls and property access
            return createProxy(orig);
          }

          // Regular function - wrap to format Promise results
          const boundFn = orig.bind(target);
          return (...args: any[]) => {
            const result = boundFn(...args);
            if (result && typeof result.then === 'function') {
              return result.then(formatResponse);
            }
            return result;
          };
        }

        // If it's an object, recursively proxy it
        if (typeof orig === 'object') {
          return createProxy(orig);
        }

        return orig;
      },

      // Handle function invocation when the target itself is a function
      apply(target, thisArg, args) {
        const result: any = Reflect.apply(target, thisArg, args);
        if (result && typeof result.then === 'function') {
          return result.then(formatResponse);
        }
        return result;
      },
    });

    proxyCache.set(target, proxy);
    return proxy;
  };

  return createProxy(client) as TwilioType;
};
