import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, Stack, type StackProps, Tags } from "aws-cdk-lib";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { Distribution, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
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

    const distribution = new Distribution(this, "WebDistribution", {
      defaultBehavior: {
        origin: new S3Origin(webBucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(1),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(1),
        },
      ],
    });

    new cdk.CfnOutput(this, "WebBucketName", { value: webBucket.bucketName });
    new cdk.CfnOutput(this, "WebDistributionId", { value: distribution.distributionId });
    new cdk.CfnOutput(this, "WebDistributionDomain", { value: distribution.domainName });
  }
}
