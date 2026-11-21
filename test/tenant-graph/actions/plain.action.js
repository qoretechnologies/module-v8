// an action whose package requires fs at its top only, before the seal: reported, not refused
const top = require("top-dep");
const action = "plain";
exports.definition = {
    "app": "tenant-graph", "action": action, "display_name": action, "short_desc": action, "desc": action,
    "action_code": 2,
    "api_function": async (obj) => ({"plain": top.name}),
};
