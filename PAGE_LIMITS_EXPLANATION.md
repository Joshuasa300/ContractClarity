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
| **Free** | 50,000      | ~125      | 3 lifetime         | Personal contracts (lease, employment) |
| **Plus** | 200,000     | ~500      | 50/month           | Small business (vendor agreements, NDAs) |
| **Pro**  | 500,000     | ~1,250    | 200/month          | Medium business (complex contracts, M&A) |
| **Premium** | 1,000,000 | ~2,500    | 1,000/month        | Enterprise (large legal documents) |

### Real Examples

**Small Contract (5 pages):**
- Characters: ~10,000 (2,000 per page)
- Tokens: 2,500 + 800 + 2,000 = 5,300 tokens
- ✅ Fits all plans

**Medium Contract (50 pages):**
- Characters: ~100,000
- Tokens: 25,000 + 800 + 2,000 = 27,800 tokens
- ✅ Free: Yes (27,800 < 50,000)
- ✅ All paid plans: Yes

**Large Contract (200 pages):**
- Characters: ~400,000
- Tokens: 100,000 + 800 + 2,000 = 102,800 tokens
- ❌ Free: No (102,800 > 50,000) - Need Plus or higher
- ✅ Plus: Yes (102,800 < 200,000)

**Enterprise Contract (1,000 pages):**
- Characters: ~2,000,000
- Tokens: 500,000 + 800 + 2,000 = 502,800 tokens
- ❌ Free/Plus/Pro: No - Need Premium
- ✅ Premium: Yes (502,800 < 1,000,000)

### Dual Limit System

The system uses **both** limits:

1. **Document Size Limit**: Maximum pages per single document
2. **Monthly Count Limit**: Total number of contracts per month

**Example for Plus Plan:**
- Can analyze up to 50 contracts per month
- Each contract can be up to 500 pages
- Could analyze: 50 × 10-page contracts OR 25 × 20-page contracts, etc.

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