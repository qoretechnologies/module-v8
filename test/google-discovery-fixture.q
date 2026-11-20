# Copyright (C) 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
# Synthetic Discovery schema: test method semantics without contacting Google.
class GoogleDiscoveryFixture inherits GoogleDataProviderBase {
    # runs once when a test starts, before any reader of the cache; the cache's lock is internal to the base class
    static seed() {
        info_map{"qore-fixture-gmail"} = {
            "schemas": {},
            "resources": {"users": {"resources": {"messages": {"methods": {
                "send": {"httpMethod": "POST", "path": "users/{userId}/messages/send",
                    "parameters": {"userId": {"type": "string", "location": "path", "required": True}}},
                "get": {"httpMethod": "GET", "path": "users/{userId}/messages/{id}",
                    "parameters": {
                        "userId": {"type": "string", "location": "path", "required": True},
                        "id": {"type": "string", "location": "path", "required": True},
                    }},
            }}}}},
        };
    }
}
