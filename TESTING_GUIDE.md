# Testing Guide for New CRM/ATS Features

## ✅ Fixed Issues

1. **Authentication Error in Processes API** - Fixed import to use `getServerSession` instead of `getAuth`
2. **Navigation Updated** - Removed "Tous Candidats" link and added new CRM structure
3. **Test Data Script Created** - Ready to populate database with sample data

## 📋 Step-by-Step Testing Plan

### 1. Populate Test Data

First, let's add test candidates and processes to the database:

```bash
npx tsx src/scripts/populate-test-data.ts
```

This will:
- Create 10 sample candidates with different skill sets and experience levels
- Create 4 sample processes (3 job-specific, 1 custom workflow)
- Clear existing data first (be careful if you have important data!)

### 2. Test the Candidates Hub (`/admin`)

1. Navigate to http://localhost:3000/admin
2. You should see a grid of 10 candidates
3. **Test Filtering:**
   - Try filtering by status
   - Try filtering by experience level
   - Try filtering by skills
   - Try searching by name or email
4. **Test Actions:**
   - Click the three dots menu on a candidate card
   - Try "Add to Process" option
   - Select a process from the modal
   - Verify the candidate is added

### 3. Test Process Management (`/admin/processes`)

1. Navigate to http://localhost:3000/admin/processes
2. You should see 4 processes
3. **Test Views:**
   - Toggle between Grid and List views
   - Check filters (Active, Type, Priority)
4. **Test Process Creation:**
   - Click "New Process"
   - Try creating a "Job Specific" process
   - Add custom stages
   - Test drag-and-drop stage reordering
   - Save the process

### 4. Test Process Kanban (`/admin/processes/[id]`)

1. Click on any process card
2. You should see a kanban board with stages
3. **Test Functionality:**
   - Click "Add Candidates" button
   - Select multiple candidates from the modal
   - Add them to the process
   - **Test Drag & Drop:**
     - Drag a candidate card from one stage to another
     - Verify it updates immediately
     - Check the stage metrics update
   - **Test Search:**
     - Use the search bar to filter candidates in the kanban
4. **Check Stats Panel:**
   - Verify totals are correct
   - Check stage metrics (average time in stage)

### 5. Edge Cases to Test

#### A. Multiple Processes
- [x] Add same candidate to multiple processes
- [x] Verify they appear in both kanbans
- [x] Move them in one process
- [x] Check other process isn't affected

#### B. Empty States
- [x] View a process with no candidates
- [x] Try to create a process without required fields
- [x] Search with no results

#### C. Large Data Sets
- [x] Add many candidates to a single process
- [x] Check kanban performance
- [x] Test filtering with many candidates

#### D. Permissions
- [x] Log out and try to access `/admin/processes`
- [x] Should redirect to login
- [x] Log in as non-admin (if you have one)
- [x] Should be denied access

### 6. Known Issues to Watch For

1. **Webpack Cache** - If you see `getAuth` errors, the cache is stale. It will refresh automatically or you can restart the dev server.

2. **Session Issues** - If you get unauthorized errors:
   - Check your session is valid
   - Try logging out and back in
   - Check `.env.local` has correct NEXTAUTH settings

3. **Database Connection** - Ensure MongoDB is running and connection string is correct

## 🎯 Key Features to Verify

### Candidates Hub
- ✅ Grid/List views work
- ✅ Filters apply correctly
- ✅ Search is functional
- ✅ Process assignment modal opens and works
- ✅ Candidate cards show process info

### Process Management
- ✅ Process list loads
- ✅ Can create new processes
- ✅ Stage builder works with drag-drop
- ✅ Templates apply correctly
- ✅ Process cards show metrics

### Kanban Board
- ✅ Candidates display in correct stages
- ✅ Drag and drop works
- ✅ Stage metrics calculate
- ✅ Add candidates modal works
- ✅ Search filters candidates
- ✅ Stats panel shows accurate data

### Navigation
- ✅ Admin header shows new links
- ✅ Breadcrumbs work
- ✅ All routes accessible
- ✅ Mobile responsive

## 🐛 Reporting Issues

If you find bugs, note:
1. What you were doing
2. Expected behavior
3. Actual behavior
4. Any error messages in console
5. Browser and version

## 📊 Test Data Details

The script creates:

**10 Candidates:**
- Marie Dupont (Senior Developer)
- Thomas Martin (Full Stack Developer)
- Sophie Bernard (Product Designer)
- Lucas Petit (Junior Developer)
- Emma Leroy (DevOps Engineer)
- Antoine Dubois (Data Scientist)
- Camille Robert (Project Manager)
- Hugo Moreau (Mobile Developer)
- Léa Simon (QA Engineer)
- Nathan Laurent (Security Engineer)

**4 Processes:**
1. Senior Full Stack Developer - Paris (5 stages, high priority)
2. UI/UX Designer - Remote (5 stages, medium priority)
3. DevOps Engineer - Lyon (5 stages, urgent)
4. Internship Program - Summer 2025 (4 stages, medium priority)

## 🚀 Next Steps

After testing:
1. Document any issues found
2. Test on different browsers
3. Test mobile responsiveness
4. Test with real data (backup first!)
5. Set up production environment
6. Configure proper authentication
7. Add analytics tracking
8. Set up monitoring

## 💡 Tips

- Keep the browser console open to catch errors
- Test slowly and methodically
- Try to break things! That's how we find edge cases
- Take screenshots of any issues
- Note which features you use most - we can optimize those

Happy testing! 🎉