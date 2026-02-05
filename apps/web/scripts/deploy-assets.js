#!/usr/bin/env node
const { execSync } = require("child_process");

const env = process.argv[2] || "dev";
const stackName = `NoteshipWeb-${env}`;
const bucketName = `noteship-web-${env}`;

console.log(`Deploying web assets for ${env} environment...`);

// Sync assets to S3
console.log(`\nSyncing assets to s3://${bucketName}...`);
execSync(`aws s3 sync out s3://${bucketName} --delete`, { stdio: "inherit" });

// Get CloudFront distribution ID
console.log(`\nGetting CloudFront distribution ID from ${stackName}...`);
const query = `Stacks[0].Outputs[?OutputKey=='WebDistributionId'].OutputValue`;
const id = execSync(
  `aws cloudformation describe-stacks --stack-name ${stackName} --query "${query}" --output text`,
  { encoding: "utf8" },
).trim();

if (!id) {
  throw new Error(`WebDistributionId not found in stack ${stackName}`);
}

console.log(`Distribution ID: ${id}`);

// Invalidate CloudFront cache
console.log(`\nInvalidating CloudFront cache...`);
execSync(`aws cloudfront create-invalidation --distribution-id ${id} --paths "/*"`, {
  stdio: "inherit",
});

console.log("\n✅ Deployment complete!");
