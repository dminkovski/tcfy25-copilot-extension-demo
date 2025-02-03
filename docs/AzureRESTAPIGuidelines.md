# https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md

## Microsoft Azure REST API Guidelines

### Introduction
- **Purpose**: Ensure consistent, developer-friendly APIs that are efficient, cost-effective, and work well with SDKs.
- **Goals**: Fault-tolerant apps, clear API contracts, and sustainable versioning.

### Core Principles
- **HTTP, REST, JSON**: Adhere to HTTP specification (RFC 7231), use REST principles, and JSON for data exchange.
- **URLs**: Use a consistent URL pattern and proper casing.

### HTTP Methods and Status Codes
- **Idempotency**: Ensure all HTTP methods are idempotent.
- **Return Codes**: Follow specific return codes for each HTTP method (e.g., 200-OK, 201-Created, 204-No Content).

### Query Parameters and Headers
- **Camel Case**: Use camel case for query parameter names.
- **Validation**: Validate all query parameter and header values.

### Resource Schema and Field Mutability
- **Consistency**: Use the same JSON schema for all operations on a given URL path.
- **Field Types**: Define fields as create-only, update, or read.

### Error Handling
- **Error Codes**: Return a structured error response with a top-level error code and message.
- **Inner Errors**: Include detailed inner errors for debugging.

### Long-Running Operations (LROs)
- **Patterns**: Use specific patterns for initiating and polling LROs.
- **Status Monitor**: Return a status monitor resource for tracking LROs.

### API Versioning
- **Query Parameter**: Use a required `api-version` query parameter.
- **Breaking Changes**: Avoid breaking changes; follow the Azure Breaking Change Policy.

### Additional Guidelines
- **Bring Your Own Storage (BYOS)**: Use Azure Storage for data files.
- **Conditional Requests**: Honor precondition headers for efficient caching and concurrency control.
- **Telemetry**: Follow Azure SDK client guidelines for telemetry and distributed tracing.

### Final Thoughts
- **Stewardship Board**: Reach out to the Azure REST API Stewardship board for guidance and support.

