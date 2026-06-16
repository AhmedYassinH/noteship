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

*Last updated: 2024*`,
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

**Important**: Review the diff before deploying to production.`,
          },
        ],
      },
    ],
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

*Pro tip*: Always iterate on your prompts. The first version is rarely optimal.`,
          },
        ],
      },
    ],
  },
];

export const mockArtifacts: Artifact[] = [
  {
    id: "a1",
    noteId: "n1",
    platform: "LinkedIn",
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

Ready to publish? Quartz works seamlessly with Vercel, Netlify, and GitHub Pages. Your digital garden awaits! 🌱`,
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

That's it! You're ready to start building your knowledge base.`,
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

Push to GitHub and deploy.`,
      },
    ],
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

Have you used Quartz? Share your experience in the comments! 👇`,
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

Worth trying if you need a knowledge base.`,
      },
    ],
  },
  {
    id: "a3",
    noteId: "n1",
    platform: "Hashnode",
    status: "draft",
    lastUpdated: "4 hours ago",
    versions: [
      {
        id: "v7",
        version: 2,
        createdAt: "4 hours ago",
        wordCount: 1334,
        content: `# Quartz: The Static Site Generator That Changed How I Share Knowledge

I've tried countless note-taking apps and site generators. Notion, Obsidian, Jekyll, Hugo—the list goes on. But when I discovered Quartz, something clicked. This wasn't just another tool; it was exactly what I needed for my digital garden.

## The Digital Garden Philosophy

Before diving into the technical details, let's talk about why Quartz exists. Traditional blogs are chronological and polished. Digital gardens are different—they're living, evolving spaces where ideas grow and connect organically.

Quartz embraces this philosophy completely. It's designed for networked thought, where every note can link to others, creating a web of interconnected knowledge.

## What Makes Quartz Special?

### 1. Markdown Native
Write in plain text. No proprietary formats, no vendor lock-in. Your notes are yours forever.

### 2. Incredibly Fast
Built on modern web technologies, Quartz generates sites in seconds, not minutes. Incremental compilation means changes appear almost instantly.

### 3. Beautiful by Default
The default theme is stunning. Dark mode, responsive design, elegant typography—it all just works.

### 4. Powerful Search
Full-text search is built in. No external services, no privacy concerns. Everything runs client-side.

### 5. Graph Visualization
See how your notes connect. The interactive graph view reveals patterns you might have missed.

## Getting Started Is Easy

Installation takes less than 5 minutes:

\`\`\`bash
npm install -g @quartzjs/cli
quartz create my-digital-garden
cd my-digital-garden
\`\`\`

The CLI walks you through setup. Choose your theme, configure plugins, and you're ready to write.

## Customization Without Complexity

The \`quartz.config.ts\` file is your control center. Here's what you can customize:

**Theme Colors**: Match your personal brand  
**Navigation**: Organize your content hierarchy  
**Plugins**: Add features like comments, analytics, or custom components  
**Content Processing**: Control how markdown is transformed

## Publishing Your Garden

When you're ready to share with the world, deployment is straightforward:

**Vercel**: One-click deployment, perfect for beginners  
**Netlify**: Excellent Git integration  
**GitHub Pages**: Free hosting for open-source projects  
**Cloudflare Pages**: Lightning-fast global CDN

All of these platforms offer free tiers that are more than sufficient for most digital gardens.

## My Workflow

Here's how I use Quartz daily:

1. Write notes in my favorite editor (VS Code with Markdown extensions)
2. Preview changes locally with \`quartz serve\`
3. Commit to Git when satisfied
4. Automatic deployment to Vercel

The entire process, from idea to published note, takes minutes.

## Tips for Success

**Start Small**: Begin with a few well-crafted notes rather than dumping everything at once.

**Use Backlinks**: Reference other notes liberally. The graph view becomes more valuable as connections grow.

**Update Regularly**: Digital gardens thrive on consistent cultivation. Even small updates keep the garden alive.

**Share Imperfect Notes**: Don't wait for perfection. Publish works-in-progress and refine over time.

## Conclusion

Quartz has transformed how I think about knowledge management. It's not just a tool—it's a mindset shift. If you've been looking for a way to share your learning journey authentically, give Quartz a try.

Your digital garden awaits. 🌱

---

*Have you tried Quartz? I'd love to hear about your experience. Drop a comment below!*`,
      },
      {
        id: "v8",
        version: 1,
        createdAt: "1 day ago",
        wordCount: 892,
        content: `# My Experience with Quartz

I recently started using Quartz and wanted to share my thoughts.

## What is Quartz?

Quartz is a static site generator for building digital gardens from Markdown files.

## Installation

Pretty straightforward. Just run npm commands and you're set up.

## Features I Like

- Fast builds
- Nice themes
- Search functionality
- Graph view is cool

## Conclusion

Worth checking out if you want to publish your notes online.`,
      },
    ],
  },
  {
    id: "a4",
    noteId: "n1",
    platform: "Substack",
    status: "draft",
    lastUpdated: "6 hours ago",
    versions: [
      {
        id: "v9",
        version: 1,
        createdAt: "6 hours ago",
        wordCount: 987,
        content: `# Tutorial: Deploy Your Quartz Digital Garden in 10 Minutes ⚡

Want to turn your Markdown notes into a live website? This tutorial will have you up and running with Quartz in under 10 minutes.

## What You'll Build

By the end of this tutorial, you'll have:
- A fully functional digital garden
- Beautiful, responsive design
- Full-text search
- Graph visualization of your notes
- Live on the internet!

## Prerequisites

You'll need:
- Node.js 18 or higher
- A code editor (VS Code recommended)
- Basic terminal knowledge

## Step 1: Install Quartz CLI (1 minute)

Open your terminal and run:

\`\`\`bash
npm install -g @quartzjs/cli
\`\`\`

This installs the Quartz command-line tool globally.

## Step 2: Create Your Project (2 minutes)

\`\`\`bash
quartz create my-digital-garden
\`\`\`

The CLI will ask a few questions:
- **Template**: Choose "Default" for your first garden
- **Content**: Start with "Empty" (you'll add notes later)
- **Theme**: Pick your favorite—they're all gorgeous!

Then navigate into your new project:

\`\`\`bash
cd my-digital-garden
\`\`\`

## Step 3: Add Your First Note (2 minutes)

Create a file in the \`content\` folder:

\`\`\`bash
echo "# My First Note\n\nWelcome to my digital garden!" > content/first-note.md
\`\`\`

Or use your editor to create \`content/first-note.md\` with any content you like.

## Step 4: Preview Locally (1 minute)

Start the development server:

\`\`\`bash
npx quartz serve
\`\`\`

Open your browser to \`localhost:8080\`. You should see your note, beautifully rendered!

## Step 5: Deploy to Vercel (4 minutes)

First, push your project to GitHub:

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
\`\`\`

Then:
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Deploy"

That's it! Vercel will automatically build and deploy your site. You'll get a live URL in about 30 seconds.

## Bonus Tips

**Custom Domain**: Add your own domain in Vercel settings  
**Auto Deploy**: Every Git push automatically updates your site  
**Dark Mode**: Toggle works out of the box  
**Backlinks**: Use \`[[note-name]]\` syntax to link notes

## What's Next?

Now that your garden is live:
- Add more notes
- Experiment with the graph view
- Customize your \`quartz.config.ts\`
- Share your garden with the world!

Happy gardening! 🌱

---

*Questions? Drop them in the comments!*`,
      },
    ],
  },
  {
    id: "a5",
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

What patterns do you use for infrastructure reusability? Let me know in the comments!`,
      },
    ],
  },
];

export const mockLinkedInBlurbs: LinkedInBlurb[] = [
  {
    id: "l1",
    noteId: "n1",
    text: "Just finished setting up Quartz for my notes. The build speed is incredible! 🚀 If you're looking for a way to turn your Markdown notes into a beautiful website, definitely check it out. #TechTools #Productivity",
    createdAt: "2 hours ago",
  },
  {
    id: "l2",
    noteId: "n1",
    text: "Static site generators have come so far. Quartz makes publishing seamless - from local Markdown files to a live site in minutes. Perfect for digital gardens and knowledge bases. 🌱 #WebDev #StaticSites",
    createdAt: "1 day ago",
  },
  {
    id: "l3",
    noteId: "n1",
    text: "Deployed my first digital garden with Quartz this week. The combination of Markdown simplicity and beautiful output is 🤌 No more wrestling with CMS platforms! #DigitalGarden #KnowledgeManagement",
    createdAt: "3 days ago",
  },
  {
    id: "l4",
    noteId: "n1",
    text: "For anyone building a personal knowledge base: Quartz + Vercel = free, fast, and beautiful. Took me 10 minutes to go from local notes to live site. Game changer. #DevTools #LearningInPublic",
    createdAt: "5 days ago",
  },
  {
    id: "l5",
    noteId: "n2",
    text: "The CoreStack pattern in AWS CDK has been a game-changer for our team. 70% faster infrastructure setup and much better consistency across projects. Highly recommend for any team using CDK. #AWS #CloudInfrastructure",
    createdAt: "3 days ago",
  },
];
