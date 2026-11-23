# Built-in custom apps

Each folder here with an `index.js` whose default export is an app created with `QoreAppCreator.createApp()` is
copied to `dist/customApps` by the build and registered in every catalogue, so every installation lists it.

None ship today. An example of the format is in `ts/examples/customApps/example` in the source repository; it is not
built or shipped, so it never appears in a customer's app catalogue. To load apps of your own without changing the
module, put them in a folder of the same layout and set `CUSTOM_APPS_DIR` to it. Each app is loaded with `require()`
from that folder, so the folder must be able to resolve what the app imports, such as `@qoretechnologies/ts-toolkit`
from its own `node_modules`. A folder that does not exist means no custom apps; one that cannot be read is an error.
