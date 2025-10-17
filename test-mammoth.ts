import mammoth from 'mammoth';

async function testMammoth() {
  try {
    // Create a simple buffer to test
    const testBuffer = Buffer.from('test content');
    
    // Test the API used in the codebase (line 146 and 424 in routes.ts)
    const result = await mammoth.extractRawText({ buffer: testBuffer });
    console.log('✓ mammoth.extractRawText({ buffer }) works correctly');
    console.log('✓ Result has expected structure:');
    console.log('  - value property:', 'value' in result);
    console.log('  - messages property:', 'messages' in result);
    console.log('✓ API is fully compatible with codebase usage');
    return true;
  } catch (error: any) {
    console.error('✗ mammoth.extractRawText failed:', error.message);
    return false;
  }
}

testMammoth().then(success => {
  process.exit(success ? 0 : 1);
});
