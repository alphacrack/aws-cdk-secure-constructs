// Test setup file for Jest

// Global test configuration
beforeAll(() => {
  // Set up any global test configuration
  process.env['CDK_DEFAULT_ACCOUNT'] = '123456789012';
  process.env['CDK_DEFAULT_REGION'] = 'us-east-1';
});

afterAll(() => {
  // Clean up global test configuration
  delete process.env['CDK_DEFAULT_ACCOUNT'];
  delete process.env['CDK_DEFAULT_REGION'];
});
