# 🎬 Hi-Ring CRM - Live Demonstration Guide

## 🚀 Quick Demo (10 Minutes)

This guide will walk you through demonstrating all the new CRM features in the browser.

**Server URL**: http://localhost:3002
**Login**: admin@example.com / admin123

---

## 📋 **Demo Checklist**

### ✅ **Feature 1: Kanban Board** (2 min)
**URL**: `/candidates`

**Steps**:
1. Login and navigate to Candidates page
2. Observe the 6-column Kanban board:
   - Applied
   - Screening
   - Interview
   - Offer
   - Hired
   - Rejected

3. **Try these actions**:
   - ✅ Search for a candidate by name
   - ✅ Filter by stage using dropdown
   - ✅ Drag a card from one column to another
   - ✅ Click on a candidate card to view profile

**What to verify**:
- Board loads with candidates distributed across stages
- Drag & drop works smoothly
- Search filters in real-time
- Stage counters update

---

### ✅ **Feature 2: Email Templates** (2 min)
**URL**: `/admin/email-templates`

**Steps**:
1. Click "Gestion Avancée" tab in admin dashboard
2. Click "Email Templates" card
3. View list of templates

4. **Create a new template**:
   - Click "+ Nouveau Template"
   - Name: "Demo Template"
   - Type: "Custom"
   - Subject: `Hello {{firstName}} {{lastName}}!`
   - Body: Type a message with `{{position}}` and `{{companyName}}`
   - Click "Prévisualiser" to see variable replacement
   - Save

**What to verify**:
- Templates list displays correctly
- Variable buttons insert `{{variable}}` tags
- Preview shows replaced variables
- Can filter by type and status
- Can toggle active/inactive

---

### ✅ **Feature 3: Bulk Email** (3 min)
**URL**: `/admin/bulk-email`

**Steps**:
1. From admin dashboard → "Envoi en Masse"

2. **Step 1 - Select Candidates**:
   - Use stage filter (e.g., "screening")
   - Check 5-10 candidates
   - Click "Suivant"

3. **Step 2 - Choose Template**:
   - Select any template
   - Click "Suivant"

4. **Step 3 - Customize Variables**:
   - Fill in "Recruteur" field with your name
   - Check preview at bottom
   - Click "Suivant"

5. **Step 4 - Review & Send**:
   - Verify summary shows correct numbers
   - Click "Envoyer" (or "Retour" to go back)

**What to verify**:
- All 4 steps navigation works
- Filters apply correctly
- Multi-select works
- Preview shows personalized content
- Progress bar appears during send

---

### ✅ **Feature 4: Analytics Dashboard** (2 min)
**URL**: `/admin/analytics`

**Steps**:
1. From admin dashboard → "Analytics" card
2. Observe the dashboard layout:

**Check these sections**:
- **4 Key Metrics Cards**:
  - Total Candidates
  - Active Candidates
  - Interviews Scheduled
  - Hired Count

- **Stage Distribution Chart**:
  - Horizontal bars showing candidates per stage
  - Percentages displayed

- **Conversion Funnel**:
  - Pyramid-style visualization
  - Shows drop-off at each stage

- **6-Month Timeline**:
  - Bar chart with 3 colors
  - Applications, Interviews, Hires

3. **Test date range selector**:
   - Change from "30 days" to "90 days"
   - Watch metrics recalculate
   - Try "Last 7 days" and "Last year"

**What to verify**:
- All charts render correctly
- Numbers make sense
- Date range filter updates everything
- Hover tooltips work on charts

---

### ✅ **Feature 5: Interview Scheduling** (1 min)
**URL**: `/candidates/[id]` → Entretiens tab

**Steps**:
1. Open any candidate profile
2. Click "Entretiens" tab
3. Click "Planifier un entretien"
4. Fill in:
   - Date & Time
   - Type (video/in-person)
   - Location or meeting link
   - Notes
5. Save

**What to verify**:
- Interview form opens
- Date picker works
- Interview appears in list after saving
- Activity is logged

---

## 🎯 **Extended Demo Scenarios**

### Scenario A: Complete Recruitment Journey (5 min)

1. **Create New Candidate**:
   ```
   Go to /candidates
   Click + button (if exists) or use existing candidate
   ```

2. **Move Through Pipeline**:
   ```
   Drag candidate: Applied → Screening
   Check activity log updated
   ```

3. **Schedule Interview**:
   ```
   Open candidate profile
   Go to "Entretiens" tab
   Schedule an interview
   ```

4. **Submit Feedback** (if interview exists):
   ```
   Click "Soumettre Feedback"
   Fill 4-step feedback form:
   - Step 1: Ratings (technical, communication, etc.)
   - Step 2: Strengths & weaknesses
   - Step 3: Key moments
   - Step 4: Review and submit
   ```

5. **Send Email**:
   ```
   Click "Envoyer Email"
   Select template
   Customize variables
   Send
   ```

6. **Check Activity Log**:
   ```
   Go to "Activités" tab
   Verify all actions logged
   ```

---

### Scenario B: Bulk Rejection (3 min)

1. Go to `/admin/bulk-email`
2. Filter: stage = "rejected"
3. Select all
4. Choose "Refus Poli" template
5. Send

**Result**: All rejected candidates receive professional rejection email

---

### Scenario C: Analytics Review (2 min)

1. Open `/admin/analytics`
2. Note current conversion rate
3. Change date range to "Last 90 days"
4. Compare metrics
5. Check which stage has most candidates
6. Identify bottlenecks in funnel

---

## 📸 **Screenshots to Take**

For documentation or presentation:

1. **Kanban Board**: Full view with all 6 columns
2. **Email Templates List**: Templates grid view
3. **Bulk Email Step 1**: Candidate selection with filters
4. **Bulk Email Step 4**: Review summary before sending
5. **Analytics Dashboard**: Full page with all charts
6. **Candidate Profile**: All tabs visible
7. **Interview Feedback Form**: Step 1 with ratings
8. **Activity Timeline**: Showing multiple activities

---

## 🎤 **Demo Script (For Presentation)**

### Introduction (30 sec)
> "Hi-Ring is now a full-featured recruitment CRM with 8 major features implemented. Let me walk you through the key capabilities."

### Kanban Board (1 min)
> "First, our visual pipeline management. We have 6 stages from application to hired. I can drag candidates between stages, search, and filter. Each movement is automatically logged."

### Email System (2 min)
> "Next, our email management. We have templates with 16 dynamic variables. I can create templates for interviews, offers, rejections. And here's the bulk email feature - I can select multiple candidates, choose a template, and send personalized emails to hundreds at once."

### Analytics (1 min)
> "Our analytics dashboard shows real-time metrics: total candidates, conversion rates, stage distribution, and historical trends over 6 months. I can adjust the date range to see different time periods."

### Interview Management (1 min)
> "For interviews, we can schedule, manage, and collect structured feedback from multiple interviewers. The system automatically aggregates ratings and recommendations."

### Closing (30 sec)
> "All features are integrated - every action is logged, analytics update in real-time, and we have complete visibility into the recruitment process."

---

## ✅ **Verification Checklist**

After the demo, verify:

- [ ] No console errors
- [ ] All pages load within 3 seconds
- [ ] Drag & drop works smoothly
- [ ] Search responds in < 500ms
- [ ] Charts render correctly
- [ ] Emails can be composed
- [ ] Data persists after refresh
- [ ] Mobile view is responsive
- [ ] All navigation links work
- [ ] Login/logout functions

---

## 🐛 **If Something Doesn't Work**

### Issue: "No candidates showing"
**Solution**: The database might be empty. You can:
1. Create candidates manually via the UI
2. Or use existing candidate management to add test data

### Issue: "Email templates not found"
**Solution**:
1. Go to `/admin/email-templates/new`
2. Create a template manually
3. Make sure it's set to "Active"

### Issue: "Charts not displaying"
**Solution**:
1. Check browser console for errors
2. Ensure candidates exist in database
3. Try different date ranges

### Issue: "Drag & drop not working"
**Solution**:
1. Refresh the page
2. Check if JavaScript is enabled
3. Try a different browser

---

## 📊 **Demo Data Recommendations**

**Ideal state for demo**:
- 20-30 candidates minimum
- Distributed across all stages
- At least 5 interviews scheduled
- 2-3 candidates hired
- 3+ email templates created
- Some email history

**If starting fresh**:
1. Create 3 email templates first
2. Add 10-15 candidates manually
3. Move them through stages
4. Schedule 2-3 interviews
5. Run the demo

---

## 🎯 **Key Messages to Highlight**

1. **Complete CRM**: Full recruitment lifecycle management
2. **Visual Pipeline**: Kanban board for easy tracking
3. **Bulk Operations**: Send hundreds of emails at once
4. **Data-Driven**: Real-time analytics and insights
5. **Integrated**: Everything logged and connected
6. **Professional**: Enterprise-grade features
7. **Scalable**: Ready for growing companies
8. **User-Friendly**: Intuitive interfaces

---

## 📝 **Notes**

- All features work in **demo mode** (emails are logged but not actually sent unless email service is configured)
- The system is production-ready but in demo mode for testing
- All data persists in MongoDB
- Performance is optimized for up to 1000+ candidates

---

## 🚀 **Next Steps After Demo**

1. **Production Setup**:
   - Configure real email service (SendGrid/AWS SES)
   - Set up proper authentication
   - Configure environment for production

2. **Training**:
   - Train recruiters on Kanban workflow
   - Show HR managers analytics dashboard
   - Demonstrate email templates to team

3. **Customization**:
   - Add custom fields as needed
   - Create company-specific templates
   - Adjust stages/workflow if needed

---

**Happy Demoing!** 🎬

**Version**: 1.0
**Last Updated**: October 2025
