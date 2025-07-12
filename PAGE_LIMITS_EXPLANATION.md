# Page Limits Update - Document Size Validation Enhancement

## Summary of Changes
Updated the page counting system to use actual PDF page counts instead of character-based estimation, fixing severe accuracy issues where documents were showing incorrect page counts.

## Implementation Details

### Before (Problematic):
- Used character-based estimation (text.length / 2000)
- 10-page PDF was showing as 219 pages
- Led to false rejections of valid documents

### After (Fixed):
- Uses actual PDF page count from pdf2json parser
- Accurate page counting for all document types
- Proper validation against plan limits

### Updated Page Limits:
- **Free Plan**: 50 pages (increased from 25 to accommodate typical contracts)
- **Plus Plan**: 200 pages
- **Pro Plan**: 600 pages  
- **Premium Plan**: 1000 pages

### Token Limits Updated:
- **Free Plan**: 35,000 tokens (increased from 25,000)
- **Plus Plan**: 100,000 tokens
- **Pro Plan**: 300,000 tokens
- **Premium Plan**: 500,000 tokens

## Benefits
1. **Accurate Validation**: Users see correct page counts before upload
2. **Fair Usage**: Prevents false rejections of valid documents  
3. **Better UX**: Clear feedback on document size vs limits
4. **Cost Management**: Maintains token control while allowing reasonable document sizes

## Technical Implementation
- Enhanced `validateDocumentSize` in ContractUpload component
- Updated page counting logic in server validation
- Improved error messaging for oversized documents
- Added visual indicators for usage status

This update resolves the critical issue where users were unable to upload legitimate contracts due to inaccurate page counting.