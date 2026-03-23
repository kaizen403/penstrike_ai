# PenStrike AI

AI penetration testing platform with autonomous security agents.

## What It Does

PenStrike AI performs automated security assessments using AI agents that:

- Discover and map attack surfaces
- Test for OWASP Top 10 vulnerabilities
- Execute proof-of-concept exploits
- Generate detailed vulnerability reports

## Quick Start

```bash
npm install

# Setup API key
cp .env.example apps/api/.env
# Edit apps/api/.env and add your ANTHROPIC_API_KEY

npm run dev
```

Open http://localhost:3000 and enter a target URL to begin scanning.

## Usage

1. Enter target URL (e.g., `https://example.com`)
2. Select agent:
   - **CyberStrike**: Full-spectrum security testing
   - **Web Application**: OWASP-focused web testing
3. Click "Launch Scan"
4. Watch findings appear in real-time

## Security Notice

**For authorized testing only.** Always have explicit permission before scanning any target.

## License

MIT
