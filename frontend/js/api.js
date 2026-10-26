/**
 * CrimeVault API Client
 * Centralized HTTP communication with the Java/Spring Boot backend.
 *
 * This file does not connect directly to Oracle.
 * Database-specific fields will be added only after schema confirmation.
 */

const CrimeVaultAPI = (() => {
    const BASE_URL = "http://localhost:8080/api";

    /**
     * Sends an HTTP request and handles JSON responses and errors.
     */
    async function request(endpoint, options = {}) {
        const config = {
            method: options.method || "GET",
            headers: {
                "Accept": "application/json",
                ...(options.body !== undefined
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...options.headers
            }
        };

        if (options.body !== undefined) {
            config.body = JSON.stringify(options.body);
        }

        let response;

        try {
            response = await fetch(`${BASE_URL}${endpoint}`, config);
        } catch (error) {
            throw new Error(
                "Cannot connect to the CrimeVault backend. " +
                "Check that the Spring Boot server is running on port 8080."
            );
        }

        const contentType = response.headers.get("content-type") || "";
        let data = null;

        if (response.status !== 204) {
            if (contentType.includes("application/json")) {
                const body = await response.text();
                if (body.trim()) {
                    try {
                        data = JSON.parse(body);
                    } catch {
                        const error = new Error("The backend returned malformed JSON.");
                        error.status = response.status;
                        throw error;
                    }
                }
            } else {
                const text = await response.text();
                data = text ? { message: text } : null;
            }
        }

        if (!response.ok) {
            const message =
                data?.message ||
                data?.error ||
                `Request failed with HTTP ${response.status}`;

            const error = new Error(message);
            error.status = response.status;
            error.details = data;
            throw error;
        }

        return data;
    }

    return Object.freeze({
        get(endpoint) {
            return request(endpoint);
        },

        post(endpoint, body) {
            return request(endpoint, {
                method: "POST",
                body
            });
        },

        put(endpoint, body) {
            return request(endpoint, {
                method: "PUT",
                body
            });
        },

        delete(endpoint) {
            return request(endpoint, { method: "DELETE" });
        },
    });
})();
