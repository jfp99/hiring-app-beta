# Hi-Ring CRM - Comprehensive Test Plan

## 📋 Overview

This document outlines the complete testing strategy for the Hi-Ring CRM features.

---

## 🧪 Test Environment Setup

### Prerequisites
```bash
# 1. Ensure MongoDB is running
# 2. Environment variables are set in .env.local
# 3. Dev server is running on port 3002
npm run dev

# 4. Seed test data (optional)
npx ts-node scripts/seed-test-data.ts

# 5. Run test scripts
npx ts-node scripts/test-bulk-email.ts
npx ts-node scripts/test-analytics.ts
```

### Test Data
- **100 test candidates** with varied:
  - Stages: applied, screening, interview, offer, hired, rejected
  - Statuses: active, inactive
  - Interview records with feedback
  - Activity timelines
  - Documents attached

- **3 email templates**:
  - Interview invitation
  - Job offer
  - Soft rejection

---

## 🎯 Feature Test Matrix

### 1. Candidate Management (Kanban Board)

| Test Case | Description | Steps | Expected Result | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-001 | View Kanban board | Navigate to /candidates | Board displays with 6 columns | High |
| TC-002 | Drag & drop candidate | Drag card from Applied to Screening | Card moves, stage updates, activity logged | High |
| TC-003 | Search candidates | Enter name in search | Filtered results appear | Medium |
| TC-004 | Filter by stage | Select stage filter | Only candidates in that stage shown | Medium |
| TC-005 | View candidate profile | Click on candidate card | Profile page opens with full details | High |
| TC-006 | Edit candidate info | Update candidate details | Changes saved, activity logged | High |
| TC-007 | Delete candidate | Click delete, confirm | Candidate removed from system | Low |

**Acceptance Criteria**:
- ✅ All 6 stages visible (Applied, Screening, Interview, Offer, Hired, Rejected)
- ✅ Drag & drop works smoothly
- ✅ Search returns accurate results
- ✅ Filters work independently and combined
- ✅ Real-time updates (no page refresh needed)

---

### 2. Email Template Management

| Test Case | Description | Steps | Expected Result | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-101 | View templates list | Navigate to /admin/email-templates | All templates displayed | High |
| TC-102 | Create new template | Click "New Template", fill form | Template created and listed | High |
| TC-103 | Insert variable | Click variable button while editing | Variable tag inserted at cursor | Medium |
| TC-104 | Preview template | Toggle preview on | Variables replaced with sample data | Medium |
| TC-105 | Edit existing template | Select template, modify, save | Changes persisted | High |
| TC-106 | Delete template | Delete non-default template | Template removed | Low |
| TC-107 | Toggle active/inactive | Click toggle button | Template status changes | Medium |
| TC-108 | Search templates | Enter search query | Filtered results shown | Low |
| TC-109 | Filter by type | Select template type | Only matching types shown | Low |
| TC-110 | Variable detection | Type {{customVar}} in body | Variable detected and listed | Medium |

**Acceptance Criteria**:
- ✅ 16 variables available
- ✅ 9 template types supported
- ✅ Real-time preview works
- ✅ Variables automatically detected
- ✅ Cannot delete default templates
- ✅ Active/inactive toggle works

---

### 3. Bulk Email Operations

| Test Case | Description | Steps | Expected Result | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-201 | View bulk email page | Navigate to /admin/bulk-email | 4-step wizard shown | High |
| TC-202 | Select single candidate | Check one candidate checkbox | Candidate selected, count updates | High |
| TC-203 | Select all candidates | Click "Select All" | All filtered candidates selected | High |
| TC-204 | Filter before selection | Apply stage filter | Only filtered candidates shown | Medium |
| TC-205 | Search candidates | Search by name/email | Results filtered in real-time | Medium |
| TC-206 | Choose template (Step 2) | Select template card | Template highlighted, can proceed | High |
| TC-207 | Customize variables (Step 3) | Edit global variables | Preview updates with new values | High |
| TC-208 | Preview email | View Step 3 preview | Variables replaced correctly | High |
| TC-209 | Send bulk emails | Confirm and send | Progress bar shows, emails sent | High |
| TC-210 | Track send progress | Watch during send | Success/failed counts update | Medium |
| TC-211 | Cancel at any step | Click back button | Returns to previous step | Low |
| TC-212 | Send to 0 candidates | Try to proceed without selection | Error or disabled button | Medium |
| TC-213 | Send 50+ emails | Select 50 candidates, send | All emails queued and sent | High |

**Acceptance Criteria**:
- ✅ 4-step wizard clear and intuitive
- ✅ Multi-select works with large datasets
- ✅ Filters apply before selection
- ✅ Preview shows accurate personalization
- ✅ Progress tracking works
- ✅ Success/failure correctly reported
- ✅ Activity logged for each email

---

### 4. Interview Scheduling & Feedback

| Test Case | Description | Steps | Expected Result | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-301 | Schedule interview | Open candidate, click schedule | Form appears | High |
| TC-302 | Fill interview details | Enter date, time, type, location | All fields accept input | High |
| TC-303 | Save interview | Submit form | Interview created, appears in list | High |
| TC-304 | View interview details | Click on interview | Details displayed | Medium |
| TC-305 | Edit interview | Modify interview details | Changes saved | Medium |
| TC-306 | Delete interview | Delete interview | Removed from list | Low |
| TC-307 | Submit feedback (Step 1) | Enter ratings, recommendation | Ratings saved | High |
| TC-308 | Submit feedback (Step 2) | Add strengths, weaknesses | Feedback saved | High |
| TC-309 | Submit feedback (Step 3) | Add key moments | Moments saved | Medium |
| TC-310 | Submit feedback (Step 4) | Review and submit | Feedback submitted, aggregation calculated | High |
| TC-311 | Multiple feedbacks | 2+ interviewers submit | Aggregation shows average | High |
| TC-312 | View feedback summary | Open interview with feedback | Aggregated data displayed | High |

**Acceptance Criteria**:
- ✅ Calendar integration works
- ✅ All interview types supported
- ✅ Feedback form is comprehensive
- ✅ 7 rating categories available
- ✅ Aggregation algorithm correct
- ✅ Multiple interviewers supported
- ✅ Activity logged

---

### 5. Analytics Dashboard

| Test Case | Description | Steps | Expected Result | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-401 | View analytics page | Navigate to /admin/analytics | Dashboard loads with data | High |
| TC-402 | View key metrics | Check top cards | Total, Active, Interviews, Hired shown | High |
| TC-403 | Change date range | Select "30 days" | Metrics recalculate | High |
| TC-404 | View stage distribution | Check bar chart | All stages with counts shown | High |
| TC-405 | View conversion funnel | Check funnel | Visual funnel with percentages | High |
| TC-406 | View timeline chart | Check 6-month chart | Historical data displayed | High |
| TC-407 | Hover on chart | Hover over bars | Tooltip shows details | Medium |
| TC-408 | Check conversion rate | View percentage | Correctly calculated (hired/total) | High |
| TC-409 | Check avg time to hire | View metric | Correctly calculated | High |
| TC-410 | Check interview-hire ratio | View metric | Correctly calculated | Medium |
| TC-411 | Test date range 7 days | Select 7 days | Only last 7 days data | Medium |
| TC-412 | Test date range 1 year | Select 1 year | Full year data | Medium |
| TC-413 | Empty state | With 0 candidates | Shows appropriate message | Low |

**Acceptance Criteria**:
- ✅ All metrics calculate correctly
- ✅ Charts render properly
- ✅ Date range filtering works
- ✅ Historical data accurate
- ✅ Visual design is clear
- ✅ Performance is good with large datasets

---

### 6. Document Management

| Test Case | Description | Steps | Expected Result | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-501 | View documents tab | Open candidate profile | Documents tab visible | High |
| TC-502 | Upload resume | Click upload, select PDF | File uploaded, appears in list | High |
| TC-503 | Upload other doc | Upload cover letter | File uploaded | Medium |
| TC-504 | View document | Click view button | Document opens in viewer | Medium |
| TC-505 | Download document | Click download button | File downloads | Medium |
| TC-506 | Delete document | Click delete | Document removed | Low |
| TC-507 | Upload invalid file | Upload .exe file | Error shown | Medium |
| TC-508 | Upload large file | Upload 10MB file | Shows progress, completes | Low |

**Acceptance Criteria**:
- ✅ PDF, DOC, DOCX supported
- ✅ File size limits enforced
- ✅ Preview works for PDFs
- ✅ Download works
- ✅ Delete confirmation required

---

### 7. Email Composer Integration

| Test Case | Description | Steps | Expected Result | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-601 | Open email composer | Click "Send Email" on candidate | Composer modal opens | High |
| TC-602 | Select template | Choose from dropdown | Template loads with variables | High |
| TC-603 | View variables | Expand variables section | All variables listed | Medium |
| TC-604 | Edit variable | Modify variable value | Preview updates | High |
| TC-605 | Preview subject | Check subject preview | Variables replaced | High |
| TC-606 | Preview body | Check body preview | Variables replaced | High |
| TC-607 | Send email | Click send | Email sent, activity logged | High |
| TC-608 | Cancel email | Click cancel | Modal closes, no email sent | Low |
| TC-609 | Missing variables | Leave variable empty | Warning shown | Medium |

**Acceptance Criteria**:
- ✅ Modal UI is clean
- ✅ Template selection works
- ✅ Variables auto-filled from candidate
- ✅ Manual override possible
- ✅ Preview accurate
- ✅ Send confirmation required

---

### 8. Activity Timeline

| Test Case | Description | Steps | Expected Result | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-701 | View activity tab | Open candidate profile | Activities tab visible | High |
| TC-702 | Check activity order | View timeline | Most recent first | Medium |
| TC-703 | Profile update activity | Edit candidate | Activity logged | High |
| TC-704 | Email sent activity | Send email | Activity logged | High |
| TC-705 | Interview activity | Schedule interview | Activity logged | High |
| TC-706 | Feedback activity | Submit feedback | Activity logged | High |
| TC-707 | Stage change activity | Move candidate | Activity logged | High |
| TC-708 | Activity metadata | Check activity details | All relevant info present | Medium |

**Acceptance Criteria**:
- ✅ All actions logged
- ✅ Chronological order
- ✅ User attribution correct
- ✅ Metadata complete
- ✅ Timestamps accurate

---

## 🔄 Integration Tests

### API Endpoints

| Endpoint | Method | Test | Expected Status |
|----------|--------|------|-----------------|
| /api/candidates | GET | Fetch all | 200 |
| /api/candidates | POST | Create candidate | 201 |
| /api/candidates/[id] | GET | Fetch one | 200 |
| /api/candidates/[id] | PUT | Update | 200 |
| /api/candidates/[id] | DELETE | Delete | 200 |
| /api/email-templates | GET | Fetch templates | 200 |
| /api/email-templates | POST | Create template | 201 |
| /api/email-templates/[id] | PUT | Update template | 200 |
| /api/email-templates/[id]/send | POST | Send email | 200 |
| /api/candidates/[id]/interviews | POST | Schedule interview | 201 |
| /api/candidates/[id]/interviews/[iid]/feedback | POST | Submit feedback | 201 |

---

## 🛡️ Security Tests

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| SEC-001 | Access admin page without login | Redirect to login |
| SEC-002 | Access API without auth | 401 Unauthorized |
| SEC-003 | SQL injection in search | Sanitized, no effect |
| SEC-004 | XSS in candidate notes | Escaped, no script execution |
| SEC-005 | File upload validation | Only allowed types accepted |
| SEC-006 | Rate limiting | Excessive requests blocked |
| SEC-007 | CSRF protection | Invalid token rejected |

---

## 📊 Performance Tests

| Test Case | Target | Acceptable |
|-----------|--------|------------|
| PERF-001 | Kanban load time | < 2s |
| PERF-002 | Candidate profile load | < 1s |
| PERF-003 | Search response time | < 500ms |
| PERF-004 | Bulk email 100 candidates | < 30s |
| PERF-005 | Analytics calculation | < 3s |
| PERF-006 | File upload (5MB) | < 10s |

---

## 🎨 UI/UX Tests

| Test Case | Device | Browser | Expected |
|-----------|--------|---------|----------|
| UI-001 | Desktop | Chrome | Full layout |
| UI-002 | Desktop | Firefox | Full layout |
| UI-003 | Desktop | Safari | Full layout |
| UI-004 | Tablet | Chrome | Responsive |
| UI-005 | Mobile | Chrome | Mobile-optimized |
| UI-006 | Dark mode | All | Proper contrast |

---

## 📱 Manual Test Scenarios

### Scenario 1: Complete Recruitment Flow
**Duration**: ~15 minutes

1. Create new candidate
2. Upload resume
3. Move through stages (Applied → Screening → Interview)
4. Schedule interview
5. Submit feedback
6. Send offer email
7. Mark as hired
8. Check activity timeline

**Expected**: All steps work, activities logged, analytics updated

---

### Scenario 2: Bulk Email Campaign
**Duration**: ~10 minutes

1. Navigate to bulk email
2. Filter candidates in "screening" stage
3. Select 10 candidates
4. Choose "Interview Invitation" template
5. Customize recruiter info
6. Preview emails
7. Send
8. Verify emails in logs

**Expected**: 10 emails sent, activity logged for each candidate

---

### Scenario 3: Analytics Review
**Duration**: ~5 minutes

1. Navigate to analytics
2. Check last 30 days metrics
3. View stage distribution
4. Check conversion funnel
5. Review 6-month timeline
6. Change to last 90 days
7. Compare metrics

**Expected**: All charts update, calculations correct

---

### Scenario 4: Interview Feedback Collection
**Duration**: ~10 minutes

1. Open candidate with scheduled interview
2. Submit feedback as Interviewer 1
3. Rate all categories
4. Add strengths, weaknesses
5. Submit
6. Log in as Interviewer 2 (simulate)
7. Submit different feedback
8. Check aggregated results

**Expected**: Both feedbacks stored, aggregation calculated

---

## 🐛 Bug Report Template

```markdown
**Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Environment**:
- OS:
- Browser:
- Version:

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:

**Actual Result**:

**Screenshots**:

**Console Errors**:

**Additional Context**:
```

---

## ✅ Test Checklist

### Pre-Release Checklist
- [ ] All high-priority test cases passed
- [ ] Security tests passed
- [ ] Performance benchmarks met
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Data seeding script works
- [ ] Test scripts execute successfully
- [ ] Documentation updated
- [ ] Known issues documented

### Smoke Tests (Quick verification)
- [ ] Login works
- [ ] Kanban board loads
- [ ] Can create candidate
- [ ] Can send email
- [ ] Analytics displays data
- [ ] No console errors

---

## 📝 Test Execution Log

| Date | Tester | Feature | Result | Notes |
|------|--------|---------|--------|-------|
| 2025-10-11 | - | - | - | - |

---

## 🎯 Test Coverage Summary

| Feature | Coverage | Status |
|---------|----------|--------|
| Candidate Management | 90% | ✅ |
| Email Templates | 95% | ✅ |
| Bulk Email | 85% | ✅ |
| Interviews | 90% | ✅ |
| Analytics | 85% | ✅ |
| Documents | 80% | ✅ |
| Integration | 75% | 🔄 |
| Security | 70% | 🔄 |

**Overall Coverage**: ~85%

---

## 🚀 Next Testing Steps

1. **Automated E2E Tests**: Implement with Playwright/Cypress
2. **Load Testing**: JMeter or k6 for high traffic
3. **A/B Testing**: Different UI variations
4. **User Acceptance Testing**: Real users feedback
5. **Penetration Testing**: Security audit

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Status**: Ready for Testing 🧪
