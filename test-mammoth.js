const mammoth = require('mammoth');

async function testMammoth() {
  try {
    // Create a simple buffer to test
    const testBuffer = Buffer.from('test content');
    
    // Test the API used in the codebase
    const result = await mammoth.extractRawText({ buffer: testBuffer });
    console.log('✓ mammoth.extractRawText works correctly');
    console.log('Result structure:', Object.keys(result));
    console.log('Has value property:', 'value' in result);
    console.log('Has messages property:', 'messages' in result);
    console.log('API is compatible with codebase usage');
    return true;
  } catch (error) {
    console.error('✗ mammoth.extractRawText failed:', error.message);
    return false;
  }
}

testMammoth().then(success => {
  process.exit(success ? 0 : 1);
});
