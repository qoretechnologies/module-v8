// an action whose package requires fs in a function, after the seal: refused for tenants
const dep = require("lazy-dep");
const action = "lazy";
exports.definition = {
    "app": "tenant-graph", "action": action, "display_name": action, "short_desc": action, "desc": action,
    "action_code": 2,
    "api_function": async (obj) => ({"lazy": dep.read()}),
};
