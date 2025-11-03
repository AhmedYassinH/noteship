export interface Note {
  id: string;
  name: string;
  content: string;
}

export interface FolderItem {
  id: string;
  name: string;
  notes: Note[];
  expanded?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  folders: FolderItem[];
  expanded?: boolean;
}

export interface ArtifactVersion {
  id: string;
  version: number;
  createdAt: string;
  content: string;
  wordCount: number;
}

export interface Artifact {
  id: string;
  noteId: string;
  platform: string;
  status: "draft" | "published";
  lastUpdated: string;
  versions: ArtifactVersion[];
}

export interface LinkedInBlurb {
  id: string;
  noteId: string;
  text: string;
  createdAt: string;
}

export const mockWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Personal",
    expanded: true,
    folders: [
      {
        id: "f1",
        name: "AWS Notes",
        expanded: true,
        notes: [
          {
            id: "n1",
            name: "Quartz setup.md",
            content: `# Quartz Setup Guide

## Introduction

Quartz is a fast, batteries-included static-site generator that transforms Markdown content into a fully functional website.

### Prerequisites

- Node.js 18+
- Git
- Basic understanding of Markdown

## Installation Steps

\`\`\`bash
npm install -g @quartzjs/cli
quartz create my-notes
cd my-notes
\`\`\`

### Configuration

Edit \`quartz.config.ts\` to customize:

- Theme colors
- Navigation structure
- Plugins

> **Note**: Always backup your content before major updates.

## Key Features

- [ ] Fast builds with incremental compilation
- [x] Beautiful, responsive themes
- [x] Full-text search
- [ ] Graph view of connections

## Publishing

Deploy to platforms like:

1. **Vercel** - Recommended for beginners
2. **Netlify** - Great Git integration  
3. **GitHub Pages** - Free hosting

---

*Last updated: 2024*`
          },
          {
            id: "n2",
            name: "CDK CoreStack.md",
            content: `# AWS CDK CoreStack Pattern

## Overview

The CoreStack pattern provides a reusable infrastructure foundation for AWS applications using CDK.

## Architecture

\`\`\`typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2
    });
  }
}
\`\`\`

### Key Components

1. **VPC** - Network isolation
2. **Security Groups** - Access control
3. **IAM Roles** - Permission management

## Best Practices

- Use construct libraries
- Tag all resources
- Enable CloudWatch logging
- Implement least privilege

> Always test in dev environment first

## Deployment

\`\`\`bash
cdk synth
cdk deploy CoreStack
\`\`\`

**Important**: Review the diff before deploying to production.`
          }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Tech Writing",
    expanded: false,
    folders: [
      {
        id: "f2",
        name: "AI Prompts",
        notes: [
          {
            id: "n3",
            name: "GPT-4 Tips.md",
            content: `# GPT-4 Prompting Best Practices

## Introduction

Effective prompting is key to getting high-quality outputs from GPT-4.

## Core Principles

### 1. Be Specific

Instead of:
> "Write about AI"

Use:
> "Write a 500-word article explaining how transformer models work, targeted at software engineers with no ML background"

### 2. Provide Context

Give the model relevant background information:

\`\`\`
Context: You are a technical writer for a developer blog.
Task: Explain React Server Components in simple terms.
Audience: Frontend developers familiar with React hooks.
\`\`\`

### 3. Use Examples

Show the model what you want:

**Input**: "API error occurred"
**Expected Output**: "⚠️ Authentication failed. Please check your API key and try again."

## Advanced Techniques

- **Chain of Thought**: Ask the model to explain its reasoning
- **Few-Shot Learning**: Provide 2-3 examples
- **Iterative Refinement**: Build on previous responses

## Common Mistakes

- [ ] Being too vague
- [ ] Not specifying format
- [ ] Ignoring token limits
- [ ] No quality criteria

---

*Pro tip*: Always iterate on your prompts. The first version is rarely optimal.`
          }
        ]
      }
    ]
  }
];

export const mockArtifacts: Artifact[] = [
  {
    id: "a1",
    noteId: "n1",
    platform: "Medium",
    status: "draft",
    lastUpdated: "2 hours ago",
    versions: [
      {
        id: "v1",
        version: 3,
        createdAt: "2 hours ago",
        wordCount: 1247,
        content: `# Getting Started with Quartz: A Modern Approach to Digital Gardens

If you've been looking for a way to transform your scattered Markdown notes into a beautiful, interconnected website, Quartz might be exactly what you need. In this guide, I'll walk you through everything you need to know to get started.

## What is Quartz?

Quartz is a static site generator specifically designed for creating digital gardens and knowledge bases. Unlike traditional blogging platforms, Quartz embraces the interconnected nature of knowledge, making it perfect for personal wikis, documentation sites, and public note collections.

## Why Choose Quartz?

**Speed**: Quartz is built for performance. With incremental compilation and optimized builds, your site updates almost instantly.

**Beautiful by Default**: No need to spend hours tweaking CSS. Quartz comes with gorgeous, responsive themes out of the box.

**Markdown Native**: Write in plain Markdown with support for advanced features like backlinks, graph views, and full-text search.

## Getting Started

Before diving in, make sure you have:
- Node.js 18 or higher installed
- Git for version control
- A basic understanding of Markdown syntax

Installation is straightforward. Open your terminal and run these commands:

\`\`\`bash
npm install -g @quartzjs/cli
quartz create my-digital-garden
cd my-digital-garden
\`\`\`

The CLI will guide you through the initial setup, asking about your preferences for themes, plugins, and configuration.

## Next Steps

Once installed, explore the \`quartz.config.ts\` file to customize your site. You can adjust colors, navigation structure, and enable powerful plugins for features like backlinks and graph visualization.

Ready to publish? Quartz works seamlessly with Vercel, Netlify, and GitHub Pages. Your digital garden awaits! 🌱`
      },
      {
        id: "v2",
        version: 2,
        createdAt: "1 day ago",
        wordCount: 1089,
        content: `# Quartz Setup Guide for Beginners

Setting up Quartz is easier than you think. This guide covers everything from installation to deployment.

## What You'll Need

Before starting, ensure you have Node.js 18+ and Git installed on your system.

## Installation

Run the following commands:

\`\`\`bash
npm install -g @quartzjs/cli
quartz create my-notes
\`\`\`

## Configuration

Edit the config file to set up your site's appearance and behavior. You can customize themes, navigation, and plugins.

## Publishing

Deploy your site to Vercel, Netlify, or GitHub Pages with just a few commands.

That's it! You're ready to start building your knowledge base.`
      },
      {
        id: "v3",
        version: 1,
        createdAt: "3 days ago",
        wordCount: 856,
        content: `# How to Install Quartz

Quick guide to installing Quartz for your notes.

## Install

\`\`\`bash
npm install -g @quartzjs/cli
quartz create my-notes
\`\`\`

## Configure

Edit config file.

## Deploy

Push to GitHub and deploy.`
      }
    ]
  },
  {
    id: "a2",
    noteId: "n1",
    platform: "DEV.to",
    status: "published",
    lastUpdated: "1 day ago",
    versions: [
      {
        id: "v4",
        version: 2,
        createdAt: "1 day ago",
        wordCount: 1156,
        content: `# 🚀 Quartz: Build Your Digital Garden in Minutes

Hey devs! Today I'm sharing my experience setting up Quartz, a fantastic static site generator for creating interconnected note collections.

## Why I Love Quartz

Coming from Gatsby and Hugo, Quartz feels refreshingly simple. It's built specifically for knowledge bases and digital gardens, not blogs or marketing sites.

### Key Features

✅ Lightning-fast builds
✅ Beautiful themes (dark mode included!)
✅ Full-text search built-in
✅ Graph visualization of note connections
✅ Markdown-first workflow

## Setup in 3 Steps

**Step 1**: Install the CLI

\`\`\`bash
npm install -g @quartzjs/cli
\`\`\`

**Step 2**: Create your project

\`\`\`bash
quartz create my-digital-garden
cd my-digital-garden
\`\`\`

**Step 3**: Start writing

Just add Markdown files to the \`content\` folder. Quartz handles the rest!

## Customization

The \`quartz.config.ts\` file is where the magic happens. You can:

- Change color schemes
- Enable/disable plugins
- Customize navigation
- Add custom components

## Deployment

I deployed mine to Vercel in under 2 minutes. It also works great with Netlify and GitHub Pages.

## Conclusion

If you're looking for a way to organize and share your technical notes, give Quartz a try. It's actively maintained, well-documented, and the community is super helpful.

Have you used Quartz? Share your experience in the comments! 👇`
      },
      {
        id: "v5",
        version: 1,
        createdAt: "2 days ago",
        wordCount: 892,
        content: `# Quartz Review: A Developer's Perspective

I recently tried Quartz for my technical notes and wanted to share my thoughts.

## The Good

Quartz is really fast and the default themes look professional. Setup took me less than 10 minutes.

## The Setup

Installation is via npm. You run a few commands and you're ready to go.

## Conclusion

Worth trying if you need a knowledge base.`
      }
    ]
  },
  {
    id: "a3",
    noteId: "n2",
    platform: "Hashnode",
    status: "draft",
    lastUpdated: "3 days ago",
    versions: [
      {
        id: "v6",
        version: 1,
        createdAt: "3 days ago",
        wordCount: 1423,
        content: `# AWS CDK CoreStack Pattern: Building Reusable Infrastructure

When building multiple applications on AWS, you quickly realize that much of your infrastructure is repetitive. VPCs, security groups, IAM roles - these foundational components are needed for almost every project.

Enter the CoreStack pattern.

## The Problem

Without a standardized approach, teams often:
- Copy-paste infrastructure code between projects
- Spend hours recreating the same AWS resources
- Struggle with consistency across environments
- Face security issues from one-off configurations

## The CoreStack Solution

CoreStack is a reusable CDK stack that provides a solid foundation for your AWS applications. Think of it as your infrastructure starter kit.

### Core Components

**1. VPC with Best Practices**

\`\`\`typescript
const vpc = new ec2.Vpc(this, 'VPC', {
  maxAzs: 2,
  natGateways: 1,
  subnetConfiguration: [
    {
      name: 'Public',
      subnetType: ec2.SubnetType.PUBLIC,
    },
    {
      name: 'Private',
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    },
  ],
});
\`\`\`

**2. Security Groups**

Pre-configured security groups for common use cases: load balancers, application servers, databases.

**3. IAM Roles**

Base roles with least-privilege permissions that other stacks can assume.

## Implementation Tips

### Use Construct Libraries

Don't reinvent the wheel. CDK has excellent L2 and L3 constructs that handle complexity for you.

### Tag Everything

\`\`\`typescript
Tags.of(this).add('Environment', props.environment);
Tags.of(this).add('Project', props.projectName);
\`\`\`

### Enable Logging

CloudWatch logs should be enabled from day one. You'll thank yourself during troubleshooting.

## Deploying CoreStack

Before deploying to production:

1. Run \`cdk synth\` to generate CloudFormation
2. Review the template carefully
3. Use \`cdk diff\` to see what will change
4. Deploy to dev environment first
5. Test thoroughly
6. Then promote to production

## Benefits

After implementing CoreStack across our organization:
- 70% reduction in infrastructure setup time
- Consistent security posture
- Easier compliance auditing
- Faster onboarding for new projects

## Conclusion

The CoreStack pattern transforms infrastructure from a repetitive chore into a reusable asset. Start with the basics, refine over time, and watch your productivity soar.

What patterns do you use for infrastructure reusability? Let me know in the comments!`
      }
    ]
  }
];

export const mockLinkedInBlurbs: LinkedInBlurb[] = [
  {
    id: "l1",
    noteId: "n1",
    text: "Just finished setting up Quartz for my notes. The build speed is incredible! 🚀 If you're looking for a way to turn your Markdown notes into a beautiful website, definitely check it out. #TechTools #Productivity",
    createdAt: "2 hours ago"
  },
  {
    id: "l2",
    noteId: "n1",
    text: "Static site generators have come so far. Quartz makes publishing seamless - from local Markdown files to a live site in minutes. Perfect for digital gardens and knowledge bases. 🌱 #WebDev #StaticSites",
    createdAt: "1 day ago"
  },
  {
    id: "l3",
    noteId: "n2",
    text: "The CoreStack pattern in AWS CDK has been a game-changer for our team. 70% faster infrastructure setup and much better consistency across projects. Highly recommend for any team using CDK. #AWS #CloudInfrastructure",
    createdAt: "3 days ago"
  }
];
