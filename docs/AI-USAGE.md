# AI Usage Declaration

This project was built with a coding-agent workflow using the repository’s managed Next.js documentation and local validation steps. The implementation prioritizes project-specific requirements, incremental verification, and build validation before proceeding to the next milestone.

## Working approach

- Follow the spec step by step rather than jumping ahead
- Validate with the smallest relevant checks (for example, `npm run build`)
- Fix real compile/type issues before continuing
- Keep the app architecture aligned with the project’s data and auth constraints

## Local compliance notes

- The app is designed to run without live Firebase credentials by falling back to a mock local store when configuration is incomplete.
- Environment secrets stay outside version control and are loaded via `.env.local` or deployment configuration.
- The source is intentionally structured so server-side API routes remain the only place that directly touches app data and authorization logic.
