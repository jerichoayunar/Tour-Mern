# Documentation Guide
````markdown
# Documentation Guide

This document describes how to maintain and extend the API documentation and docs in this repository.

OpenAPI (`/docs/openapi.yaml`)
- The OpenAPI spec is a living file and should be updated when endpoints are added or changed.
- To add endpoints:
  1. Add the path under `paths:` with operations (`get`, `post`, etc.).
  2. Reference schemas under `components/schemas` for request and response bodies.
  3. Add `securitySchemes` if an endpoint requires authentication (e.g., `bearerAuth`).
  4. Add `components/responses` entries for common response envelopes and reuse them with `$ref`.
  5. Add `components/examples` entries for representative request/response payloads and reference them under operation `responses` -> `content` -> `examples` for better dev UX.

When adding or changing endpoints, update `/docs/SYSTEM_PROGRESS_LOG.md` with a short entry describing the change.

Swagger UI (`/docs/swagger-ui/index.html`)
- A static Swagger UI scaffold is provided to view the OpenAPI file locally or via GitHub Pages.
- To view locally, serve the repository root with a static server (e.g., `npx http-server .`), then open `http://localhost:8080/docs/swagger-ui/`.

Generating SDKs and Clients
- Use the OpenAPI Generator CLI or Swagger Codegen to generate clients in various languages:
  - Example:
    ```bash
    npx @openapitools/openapi-generator-cli generate -i docs/openapi.yaml -g javascript -o clients/js
    ```

Running Spectral locally
- Install or run Spectral via `npx` to lint and validate the OpenAPI file before committing:

```powershell
npx @stoplight/spectral-cli lint docs/openapi.yaml --ruleset docs/spectral.yml
```

If PowerShell blocks `npx` due to execution policy, run the `npx.cmd` shim or use a Bash shell.

Documentation Workflow
- Keep `docs/openapi.yaml` up to date.
- Keep `docs/SECURITY_README.md` and `docs/FULL_SECURITY_SCAN_REPORT.md` up to date if secrets or vulnerabilities change.
- Use PRs to review changes to the OpenAPI file and docs.

Adding examples and responses
- For major endpoints (bookings, packages, inquiries, clients, admin) add an example under `components/examples` and reference it in the path operation responses:

```yaml
responses:
  '200':
    $ref: '#/components/responses/Success'
    content:
      application/json:
        examples:
          example1:
            $ref: '#/components/examples/BookingExample'
```

This improves the Swagger UI and helps frontend developers and QA construct representative requests.

Automation
- CI runs `gitleaks` to detect secrets. If gitleaks flags a change, investigate and rotate secrets as needed.
- Consider adding pre-commit hooks to validate OpenAPI syntax (e.g., `spectral` linter).

Contacts
- Repository owner: update this README with contact information for doc maintainers.

````
