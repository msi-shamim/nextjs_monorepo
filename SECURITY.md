# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 2.2.x   | :white_check_mark: |
| 2.1.x   | :x:                |
| 2.0.x   | :x:                |
| 1.x     | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do NOT open a public issue.**

Instead, email **im.msishamim@gmail.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment:** within 48 hours
- **Assessment:** within 1 week
- **Fix release:** as soon as possible, depending on severity

## Scope

This security policy covers:

- The `@msishamim/create-next-monorepo` CLI tool itself
- The generated project templates and configurations
- Dependencies included in generated projects

## Best Practices for Generated Projects

The CLI generates projects with security in mind:

- `.gitignore` excludes `.env` files, credentials, and secrets
- `.env.example` documents required secrets without exposing values
- Auth templates use environment variables (never hardcoded secrets)
- Docker templates use non-root users in production containers
- nginx config includes security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Zod validation on all API inputs
- CORS configured with explicit origins
