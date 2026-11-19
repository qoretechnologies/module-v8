# Built-in custom apps

Each folder here with an `index.js` whose default export is an app created with `QoreAppCreator.createApp()` is
copied to `dist/customApps` by the build and registered in every catalogue, so every installation lists it.

None ship today. An example of the format is in `ts/examples/customApps/example`; it is not built or shipped, so it
never appears in a customer's app catalogue. To load apps of your own without changing the module, put them in a
folder of the same layout and set `CUSTOM_APPS_DIR` to it.
