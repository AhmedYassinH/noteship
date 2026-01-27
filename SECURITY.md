# Security Policy

## Reporting a Vulnerability

We take the security of Noteship seriously. If you have discovered a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report a Security Vulnerability

Please email security concerns to: **me@ahmedyassin.dev**

Include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Updates**: We will keep you informed about our progress in addressing the vulnerability.
- **Timeline**: We aim to validate and address critical vulnerabilities within 7 days.
- **Credit**: We will credit you in the release notes (if you wish) when the vulnerability is fixed.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < main  | :x:                |

We recommend always using the latest version from the `main` branch for the most up-to-date security patches.

## Security Best Practices for Contributors

### Environment Variables and Secrets

1. **Never commit secrets**: Do not commit API keys, passwords, tokens, or any sensitive credentials to the repository.
2. **Use `.env` files**: Store sensitive configuration in `.env` files (which are gitignored).
3. **Use example files**: Provide `.env.example` files with dummy values for documentation.
4. **Rotate exposed secrets**: If a secret is accidentally exposed, rotate it immediately and report it.

### Code Security

1. **Input Validation**: Always validate and sanitize user inputs.
2. **SQL Injection**: Use parameterized queries or ORMs with proper escaping.
3. **XSS Prevention**: Sanitize all user-generated content before rendering.
4. **Authentication**: Follow OAuth 2.0 and Auth0 best practices for authentication flows.
5. **Authorization**: Always verify user permissions before granting access to resources.
6. **Dependencies**: Keep dependencies up to date and review security advisories.

### Infrastructure Security

1. **AWS Resources**: Follow the principle of least privilege for IAM roles and policies.
2. **API Security**: Use HTTPS for all API communications.
3. **CORS**: Configure CORS policies appropriately to prevent unauthorized access.
4. **Rate Limiting**: Implement rate limiting to prevent abuse.

## Security Features

### Current Implementation

- **Authentication**: Auth0 integration with JWT token validation
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: All data encrypted in transit (HTTPS) and at rest (AWS S3, DynamoDB encryption)
- **Secrets Management**: Environment variables and AWS Secrets Manager
- **Input Validation**: Zod schema validation on all API endpoints
- **CORS Protection**: Configured CORS policies
- **Signed URLs**: CloudFront signed URLs for content access

### Planned Security Enhancements

- [ ] Implement Content Security Policy (CSP) headers
- [ ] Add rate limiting on API endpoints
- [ ] Implement request logging and monitoring
- [ ] Add automated security scanning in CI/CD
- [ ] Implement automated dependency vulnerability scanning

## Known Security Considerations

### Local Development

- The `.env.local.example` includes test credentials for local development only
- Never use production credentials in local development
- LocalStack and local DynamoDB are used for local testing

### Third-Party Services

This application integrates with the following third-party services:

- **Auth0**: Authentication and authorization
- **Stripe**: Payment processing
- **OpenAI**: AI-powered features
- **Qdrant**: Vector database for semantic search
- **LinkedIn & Medium**: Content publishing integrations
- **AWS**: Infrastructure (S3, DynamoDB, Lambda, SQS, CloudFront)

Each service has its own security model. Refer to their respective security documentation:
- [Auth0 Security](https://auth0.com/security)
- [Stripe Security](https://stripe.com/docs/security)
- [AWS Security Best Practices](https://aws.amazon.com/security/security-resources/)

## Security Updates

We will announce security updates through:

1. GitHub Security Advisories
2. Release notes
3. Direct communication for critical vulnerabilities

## Compliance

This project follows:

- OWASP Top 10 security guidelines
- AWS Well-Architected Framework security pillar
- OAuth 2.0 and OpenID Connect standards

## Additional Resources

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Environment and Secrets Documentation](./docs/contributing/ENV-AND-SECRETS.md)
- [Deployment Guide](./docs/technical/deployment.md)

---

**Thank you for helping keep Noteship and our users safe!**
