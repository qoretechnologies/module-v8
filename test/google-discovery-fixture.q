# Copyright (C) 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
# Synthetic Discovery schema: test method semantics without contacting Google.
class GoogleDiscoveryFixture inherits GoogleDataProviderBase {
    # publishes the document through the base class: its caches are private to it (Qore #6838)
    static seed() {
        registerSchemaInfo("qore-fixture-gmail", {
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
        });
    }
}
