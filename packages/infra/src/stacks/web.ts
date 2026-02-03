import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, Stack, type StackProps, Tags } from "aws-cdk-lib";
import {
  Distribution,
  Function as CloudFrontFunction,
  FunctionCode,
  FunctionEventType,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";
import type { NoteshipEnv } from "../config";

export interface NoteshipWebStackProps extends StackProps {
  envConfig: NoteshipEnv;
}

export class NoteshipWebStack extends Stack {
  constructor(scope: Construct, id: string, props: NoteshipWebStackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: props.envConfig.account,
        region: props.envConfig.region,
      },
    });

    const { envName } = props.envConfig;
    Tags.of(this).add("app", "noteship");
    Tags.of(this).add("env", envName);

    const webBucket = new Bucket(this, "WebBucket", {
      bucketName: `noteship-web-${envName}`,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const oai = new OriginAccessIdentity(this, "WebOAI");
    webBucket.grantRead(oai);

    // Custom domain configuration (optional)
    const customDomain = process.env.NOTESHIP_WEB_DOMAIN;
    const certificateArn = process.env.NOTESHIP_WEB_CERTIFICATE_ARN;
    let certificate;
    if (customDomain && certificateArn) {
      certificate = Certificate.fromCertificateArn(this, "WebCertificate", certificateArn);
    }

    const spaRewriteFunction = new CloudFrontFunction(this, "SpaRewriteFunction", {
      code: FunctionCode.fromInline(`function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Only rewrite browser navigations.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return request;
  }

  // Leave real files alone (.js, .css, .png, .json, etc.)
  var last = uri.split('/').pop();
  if (last && last.indexOf('.') !== -1) return request;

  // Next.js static export with trailingSlash: true
  // /callback → /callback/index.html
  // /dashboard/notes → /dashboard/notes/index.html
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else {
    request.uri = uri + '/index.html';
  }
  return request;
}`),
    });

    const distribution = new Distribution(this, "WebDistribution", {
      defaultBehavior: {
        origin: new S3Origin(webBucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: spaRewriteFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
      ],
      defaultRootObject: "index.html",
      domainNames: customDomain ? [customDomain] : undefined,
      certificate: certificate,
    });

    new cdk.CfnOutput(this, "WebBucketName", { value: webBucket.bucketName });
    new cdk.CfnOutput(this, "WebDistributionId", { value: distribution.distributionId });
    new cdk.CfnOutput(this, "WebDistributionDomain", { value: distribution.domainName });
  }
}
