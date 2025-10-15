# ✅ DATABASE INDEXES - READY FOR APPLICATION

**Status:** Script ready, apply before production deployment
**Script:** `scripts/create-indexes.ts`
**Command:** `npm run db:indexes`

## 📊 Index Summary

**Total: 37 Indexes across 10 collections**

### Collections Indexed

1. **candidates** - 10 indexes
   - email (unique)
   - status + createdAt (compound)
   - text search (firstName, lastName, email, position, company)
   - skills.name
   - assignedTo
   - tags
   - overallRating
   - experienceLevel
   - isActive + isArchived
   - appStatus

2. **interviews** - 4 indexes
   - candidateId + scheduledDate (compound)
   - interviewers
   - status
   - scheduledDate

3. **tasks** - 3 indexes
   - candidateId
   - assignedTo + status + dueDate (compound)
   - dueDate

4. **comments** - 3 indexes
   - candidateId + createdAt (compound)
   - userId
   - parentId

5. **notifications** - 2 indexes
   - userId + isRead + createdAt (compound)
   - relatedId

6. **users** - 3 indexes
   - email (unique)
   - role
   - isActive

7. **workflows** - 2 indexes
   - isActive
   - trigger.event

8. **documents** - 3 indexes
   - entityType + entityId (compound)
   - uploadedBy
   - type

9. **activities** - 3 indexes
   - userId + timestamp (compound)
   - type
   - candidateId

10. **offres** - 4 indexes
    - statut
    - categorie
    - datePublication
    - text search (titre, description, entreprise, lieu)

## 🚀 Performance Impact

### Expected Improvements

- **Query Speed:** 50-100x faster for indexed queries
- **Search:** Text search 10-20x faster
- **Pagination:** Instant page loading
- **Sorting:** No performance degradation
- **Filtering:** Real-time response

### Before Indexes (Estimated)
- Search 1000 candidates: ~500ms
- Filter by status: ~200ms
- Sort by rating: ~300ms
- Text search: ~1000ms

### After Indexes (Estimated)
- Search 1000 candidates: ~5ms
- Filter by status: ~2ms
- Sort by rating: ~3ms
- Text search: ~50ms

## 📝 Pre-Production Checklist

- [x] Script created and tested
- [ ] Run on staging database
- [ ] Run on production database
- [ ] Verify index creation
- [ ] Monitor query performance
- [ ] Document any issues

## 🔧 How to Apply

### Staging Environment
```bash
# Set staging database credentials in .env.local
MONGODB_URI=mongodb://staging-server/...
MONGODB_DB=hiring-app-staging

# Run the script
npm run db:indexes
```

### Production Environment
```bash
# Set production database credentials in .env.local
MONGODB_URI=mongodb://production-server/...
MONGODB_DB=hiring-app-production

# Run the script
npm run db:indexes
```

## ⚠️ Important Notes

1. **Backup First:** Always backup database before applying indexes
2. **Downtime:** Index creation may cause brief performance impact
3. **Monitoring:** Monitor database CPU/memory during creation
4. **Unique Indexes:** email indexes require no duplicates in existing data
5. **Text Indexes:** Only one text index allowed per collection

## 📊 Verification

After running the script, verify indexes:

```javascript
// In MongoDB shell or Compass
db.candidates.getIndexes()
db.interviews.getIndexes()
// ... etc
```

Expected output: All indexes listed with correct names and keys.

## ✅ Status: READY

The database is **ready for index application**. Run the script before production deployment for optimal performance.
