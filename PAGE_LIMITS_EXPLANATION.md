# Page Limits System Explanation

## How Page Limits Work

### Token Estimation Formula
```
Document Tokens = (Character Count ÷ 4) + System Prompt (800) + Response (2000)
Estimated Pages = Total Tokens ÷ 400
```

### Plan Limits Table

| Plan     | Token Limit | Max Pages | Contract Count Limit | Example Use Case |
|----------|-------------|-----------|---------------------|------------------|
| **Free** | 8,000       | ~20       | 2 lifetime         | Personal contracts (lease, employment) |
| **Plus** | 46,800      | ~117      | 7/month            | Small business (vendor agreements, NDAs) |
| **Pro**  | 140,000     | ~350      | 20/month           | Medium business (complex contracts, M&A) |
| **Premium** | 190,800   | ~477      | 30/month           | Enterprise (large legal documents) |

### Real Examples

**Small Contract (5 pages):**
- Characters: ~10,000 (2,000 per page)
- Tokens: 2,500 + 800 + 2,000 = 5,300 tokens
- ✅ Free: Yes (5,300 < 8,000)
- ✅ All paid plans: Yes

**Medium Contract (15 pages):**
- Characters: ~30,000
- Tokens: 7,500 + 800 + 2,000 = 10,300 tokens
- ❌ Free: No (10,300 > 8,000) - Need Plus or higher
- ✅ Plus: Yes (10,300 < 46,800)

**Large Contract (100 pages):**
- Characters: ~200,000
- Tokens: 50,000 + 800 + 2,000 = 52,800 tokens
- ❌ Free/Plus: No - Need Pro or higher
- ✅ Pro: Yes (52,800 < 140,000)

**Enterprise Contract (400 pages):**
- Characters: ~800,000
- Tokens: 200,000 + 800 + 2,000 = 202,800 tokens
- ❌ Free/Plus/Pro: No - Need Premium
- ✅ Premium: Yes (202,800 > 190,800) - **Note: This exceeds Premium limit**

### Dual Limit System

The system uses **both** limits:

1. **Document Size Limit**: Maximum pages per single document
2. **Monthly Count Limit**: Total number of contracts per month

**Example for Plus Plan:**
- Can analyze up to 7 contracts per month
- Each contract can be up to 117 pages
- Could analyze: 7 × 50-page contracts OR 7 × 10-page contracts, etc.

### Why This System is Fair

1. **Resource-Based Pricing**: Large documents cost more to process
2. **Prevents Abuse**: Users can't upload massive documents on lower plans
3. **Scalable**: Higher plans support business needs for larger documents
4. **Transparent**: Users know exactly what they can upload

### Error Messages Users See

**Document Too Large:**
> "Contract too large for free plan. Estimated 150 pages, but limit is 125 pages."

**Monthly Limit Exceeded:**
> "Monthly token limit would be exceeded. Estimated tokens needed: 30,000, Available: 15,000"