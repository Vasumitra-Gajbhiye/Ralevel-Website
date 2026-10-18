# r/alevel Website

Official web platform supporting the r/alevel student learning community.  

The website provides tools that help students collaborate, contribute resources, and earn recognition for helping others in the community.  

## Getting started

New to the codebase? Follow [`dev-onboarding/README.md`](dev-onboarding/README.md). It walks you through setting up your machine (Windows or macOS), the local databases, your own Clerk app and the environment variables, then running the site.

## Features

### Certificate System
Students who consistently help others in the community can earn official r/alevel certificates.

Features include:
- Certificate generation  
- Certificate verification system  
- Public certificate validation  

### Admin Dashboard
Administrative tools for managing the community platform.

Includes:
- Application review system
- Approval and rejection workflow
- Community voting for applications
- Resource management

### Blog Platform
Built-in blogging system that allows contributors to share educational content.

Features:
- Blog editor and publishing system
- Structured content display
- Community learning resources

### Resource System
Centralized repository of helpful academic resources for A-Level students.

### Certificate Verification
Public verification system allowing anyone to verify the authenticity of r/alevel certificates.

## Purpose

The goal of this project is to create a structured platform that encourages students to help each other while providing recognition for meaningful contributions.

The system motivates collaboration and builds a stronger academic community.

## Tech Stack

- Next.js (apps/website)
- TypeScript
- MongoDB
- Tailwind CSS
- Applications Discord bot (apps/bot) — form pings, reminders, ban appeals

## Monorepo

```bash
pnpm install
pnpm db:up        # local MongoDB (dev + test) and Redis in Docker
pnpm dev          # website on http://localhost:3000
pnpm dev:bot      # applications Discord bot (optional)
```

Coolify deploys website and bot as **separate** apps (`Dockerfile.website`, `Dockerfile.bot`). See `apps/website/src/docs/COOLIFY.md`.

## Related Community

Reddit: https://reddit.com/r/alevel  
