# -*- mode: qore; indent-tabs-mode: nil -*-
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT

public namespace TypeScriptActionInterface {

#! HubSpot REST client that verifies optional CMS grants on the current access token
/** CMS checks run at the request signing hook, after automatic refresh and on authentication retries.
    They also apply to raw and bounded REST requests. CRM requests require no introspection.
    No grant is inferred from requested scopes, persisted metadata, or a successful connection ping.
*/
public class TypeScriptHubspotRestClient inherits TypeScriptAppRestClient {
    #! Creates a HubSpot client bound to its TypeScript connection
    /** @param conn owning connection
        @param opts resolved REST options
        @param do_not_connect defer connection and authentication until the first request
        @throw RESTCLIENT-ERROR invalid REST configuration
    */
    constructor(TypeScriptAppRestConnection conn, hash<auto> opts, *softbool do_not_connect)
            : TypeScriptAppRestClient(conn, opts, do_not_connect) {
    }

    #! Returns the scope required by supported page and domain endpoints
    /** @param method HTTP method
        @param path request URI, including an optional query string
        @return the required scope, or @ref NOTHING for unrelated endpoints
        @par Example
        @code{.py}
string scope = TypeScriptHubspotRestClient::getCmsScope("GET", "/cms/v3/domains");
        @endcode
    */
    static *string getCmsScope(string method, string path) {
        # Both the legacy v3 and date-versioned CMS paths have the same scope requirements.
        if (path =~ /^\/?cms\/(v3\/pages|pages\/2026-03)(\/|\?|$)/) {
            return "content";
        }
        if (path =~ /^\/?cms\/(v3\/domains|domains\/2026-03)(\/|\?|$)/) {
            return method.upr() == "GET" || method.upr() == "HEAD" ? "cms.domains.read" : "cms.domains.write";
        }
    }

    #! Checks the grant on the token about to be sent, including after automatic refresh
    private signRequest(string method, *string path, *data body, reference<hash<auto>> hdr) {
        TypeScriptAppRestClient::signRequest(method, path, body, \hdr);
        *string scope = getCmsScope(method, path ?? "/");
        if (!scope) {
            return;
        }
        hash<auto> oauth = getOAuth2Options();
        if (!oauth.oauth2_token_url) {
            throw "HUBSPOT-CMS-CAPABILITY-ERROR", "Cannot verify CMS access: configure the HubSpot OAuth token "
                "endpoint and reauthorize the connection with the required optional CMS scope.";
        }
        # Inspect the actual outgoing bearer token, including an explicitly supplied authorization header.
        *string authorization;
        foreach hash<auto> entry in (hdr.pairIterator()) {
            if (entry.key.lwr() == "authorization") {
                if (authorization || entry.value.typeCode() != NT_STRING) {
                    throw "HUBSPOT-CMS-CAPABILITY-ERROR", "CMS requests require one Bearer authorization header.";
                }
                authorization = entry.value;
            }
        }
        *list<*string> match = (authorization ?? "") =~ x/^Bearer ([^[:space:]]+)$/i;
        if (!match) {
            throw "HUBSPOT-CMS-CAPABILITY-ERROR", "CMS requests require a HubSpot OAuth access token; "
                "reauthorize the connection.";
        }
        hash<auto> metadata;
        try {
            metadata = introspectOAuth2Token(oauth.oauth2_token_url + "/introspect", match[0]);
        } catch () {
            # Transport exceptions and HubSpot metadata can contain tokens; never propagate either.
            throw "HUBSPOT-CMS-CAPABILITY-ERROR", "Cannot verify the current HubSpot CMS grant. Check the "
                "OAuth client configuration, alternate service introspection support and connectivity, "
                "then retry or reauthorize the connection.";
        }
        if (metadata.active !== True || metadata.scopes.typeCode() != NT_LIST) {
            throw "HUBSPOT-CMS-CAPABILITY-ERROR", "HubSpot did not return an active token with valid granted "
                "scopes. Reauthorize the connection before using CMS operations.";
        }
        bool granted = False;
        foreach auto granted_scope in (metadata.scopes) {
            if (granted_scope.typeCode() != NT_STRING) {
                throw "HUBSPOT-CMS-CAPABILITY-ERROR", "HubSpot returned invalid granted scopes. "
                    "Retry or reauthorize the connection before using CMS operations.";
            }
            if (scope == granted_scope) {
                granted = True;
            }
        }
        if (!granted) {
            throw "HUBSPOT-CMS-CAPABILITY-ERROR", sprintf("HubSpot CMS requires the granted scope '%s'. "
                "It was not granted or is unavailable for this account. Enable it in the developer app and "
                "reauthorize this connection; check the account's CMS subscription. CRM access is unaffected.", scope);
        }
    }

    #! Adds actionable CMS errors to the common synchronous REST request path
    private hash<auto> sendAndDecodeResponse(*data body, string method, string path, hash<auto> hdr,
            *reference<hash<auto>> info, *softbool decode_errors, *string assume_content_type, *string shdr,
            *code signer, *bool no_auth_retry, *int max_response_bytes) {
        hash<auto> response;
        try {
            response = RestClient::sendAndDecodeResponse(body, method, path, hdr, \info, decode_errors,
                assume_content_type, shdr, signer, no_auth_retry, max_response_bytes);
        } catch (hash<ExceptionInfo> ex) {
            if (getCmsScope(method, path) && ex.arg.status_code == 403) {
                throwCmsForbidden();
            }
            rethrow;
        }
        if (getCmsScope(method, path) && response.status_code == 403) {
            throwCmsForbidden();
        }
        return response;
    }

    #! Reports scope or entitlement rejection without copying potentially sensitive server response data
    private static throwCmsForbidden() {
        throw "HUBSPOT-CMS-CAPABILITY-ERROR", "HubSpot rejected this CMS operation (HTTP 403). Check the "
            "account's CMS subscription and permissions; if scopes changed, reauthorize the connection. "
            "Refreshing a token cannot add permissions. CRM access is unaffected.";
    }
}
}
