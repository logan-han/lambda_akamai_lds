## What is this?
Lambda function fetch email from an S3 bucket and store decoded attachment file into another bucket.
Designed for Akamai LDS by EMAIL

## pre-requisitions
* S3 bucket with x days permanent deletion policy for temporal storage or it can be a path of below
* S3 bucket to store decoded akamai log
* Bucket policy for above to allow lambda & ses access (refer bucket_policy.json)
* SES validated domain and email address to receive email
* SES ruleset to store received email into S3 bucket and trigger lambda function
* Lambda IAM role with s3 access for above buckets (refer lambda_iam_role.json)

## Lambda resource requirement
* Lambda memory requirement - least 384MB
* Execution time - least 10 seconds

## How does this work?
When an email received by SES, it has a rule configured to store the email into designated S3 bucket as well as trigger a lambda function.
This labmda function picks up the email body stored in S3 and decode the uuencoded attachment then save it into another bucket.

## Packaging
npm install && zip -r lambda_akamai_lds.zip node_modules config.js index.js

## Known Issue
The node module mailparser doesn't capture filename for uuencode attachment, workaround to use mail subject as filename applied for it
skip.header.line.count is not supported by Athena yet, which injects two blank lines per file
