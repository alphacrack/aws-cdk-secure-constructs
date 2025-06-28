// Main exports for the library
export * from './constructs/secure-bucket';
export * from './blueprints/secure-bucket-defaults';

// Re-export commonly used AWS CDK types for convenience
export type { Construct } from 'constructs';
export type { Stack } from 'aws-cdk-lib';
