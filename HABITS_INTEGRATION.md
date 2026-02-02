# Habits Tracking System Integration

This document explains how the new Habits Tracking System has been integrated into the SageFlow frontend application.

## Overview

The Habits Tracking System provides comprehensive APIs to track and analyze various aspects of student habits including:
- Sleep habits
- Diet habits  
- Exercise habits
- Screen time
- Media consumption

## New Components Created

### 1. DailyHabitsTracker (`src/pages/DailyHabitsTracker.tsx`)
A dedicated component for students to track their daily habits on a day-by-day basis.

**Features:**
- Date selector to choose which day to track
- Forms for all habit categories (sleep, diet, exercise, screen time, media)
- Auto-loads existing data for selected dates
- Creates new records or updates existing ones
- Real-time validation and feedback

**Usage:**
- Navigate to `/daily-habits` route
- Select a date (defaults to today)
- Fill out the habit forms
- Submit to save/update habits

### 2. HabitsDashboard (`src/pages/HabitsDashboard.tsx`)
A comprehensive dashboard showing habits analytics and trends over time.

**Features:**
- Overall health score display
- Time range selection (week/month/quarter)
- Metric cards showing averages
- Trend charts for visual analysis
- Recent activity feed
- Quick access to daily tracking

**Usage:**
- Navigate to `/habits-dashboard` route
- Select time range to analyze
- View trends and patterns
- Click "Track Today's Habits" to go to daily tracker

## Updated Components

### 1. HolisticProfile (`src/pages/HolisticProfile.tsx`)
The existing holistic profile component has been updated to use the new habits API.

**Changes:**
- Updated form structure to match new API requirements
- Added proper data types for all habit categories
- Integrated with new habits API endpoints
- Saves habits data when profile is completed

### 2. API Service (`src/services/api.ts`)
Added comprehensive habits API integration.

**New Interfaces:**
- `SleepHabits`
- `DietHabits`
- `ExerciseHabits`
- `ScreenTimeHabits`
- `MediaConsumptionHabits`
- `HabitsSummary`
- `HabitsAnalytics`

**New API Methods:**
- CRUD operations for all habit types
- Date range queries
- Analytics and summary endpoints
- Health score calculations

## API Endpoints Used

### Sleep Habits
- `POST /api/v1/habits/sleep` - Create sleep habits
- `PUT /api/v1/habits/sleep/{id}` - Update sleep habits
- `GET /api/v1/habits/sleep/student/{studentId}/today` - Get today's sleep
- `GET /api/v1/habits/sleep/student/{studentId}/week` - Get weekly data

### Diet Habits
- `POST /api/v1/habits/diet` - Create diet habits
- `PUT /api/v1/habits/diet/{id}` - Update diet habits
- `GET /api/v1/habits/diet/student/{studentId}/range` - Get by date range

### Exercise Habits
- `POST /api/v1/habits/exercise` - Create exercise habits
- `PUT /api/v1/habits/exercise/{id}` - Update exercise habits
- `GET /api/v1/habits/exercise/student/{studentId}/range` - Get by date range

### Screen Time
- `POST /api/v1/habits/screen-time` - Create screen time record
- `PUT /api/v1/habits/screen-time/{id}` - Update screen time
- `GET /api/v1/habits/screen-time/student/{studentId}/range` - Get by date range

### Media Consumption
- `POST /api/v1/habits/media-consumption` - Create media record
- `PUT /api/v1/habits/media-consumption/{id}` - Update media record
- `GET /api/v1/habits/media-consumption/student/{studentId}/range` - Get by date range

### Analytics & Summary
- `GET /api/v1/habits/summary/student/{studentId}/week` - Weekly summary
- `GET /api/v1/habits/summary/student/{studentId}/month` - Monthly summary
- `GET /api/v1/habits/summary/student/{studentId}/health-score` - Health score

## Data Flow

1. **Initial Setup**: Student completes holistic profile with habits data
2. **Daily Tracking**: Student uses DailyHabitsTracker to log daily habits
3. **Data Storage**: Habits are saved to backend via API
4. **Analytics**: HabitsDashboard retrieves and displays trends
5. **Insights**: System provides health scores and recommendations

## Usage Examples

### Creating a Sleep Habit Record
```typescript
const sleepHabits: SleepHabits = {
  studentId: 1,
  date: "2024-01-15",
  bedtime: "22:00:00",
  wakeTime: "07:00:00",
  sleepQualityScore: 4,
  totalSleepHours: 9.0,
  notes: "Good sleep quality"
}

await apiService.createSleepHabits(sleepHabits)
```

### Getting Weekly Summary
```typescript
const weeklySummary = await apiService.getWeeklyHabitsSummary(studentId)
console.log(`Health Score: ${weeklySummary.overallHealthScore}/100`)
```

### Updating Existing Habits
```typescript
// Check if habits exist for today
const existingHabits = await apiService.getTodaySleepHabits(studentId)

if (existingHabits) {
  // Update existing record
  await apiService.updateSleepHabits(existingHabits.id, updatedData)
} else {
  // Create new record
  await apiService.createSleepHabits(newData)
}
```

## Routing

Add these routes to your main router:

```typescript
import DailyHabitsTracker from './pages/DailyHabitsTracker'
import HabitsDashboard from './pages/HabitsDashboard'

// In your router configuration
<Route path="/daily-habits" element={<DailyHabitsTracker />} />
<Route path="/habits-dashboard" element={<HabitsDashboard />} />
```

## Styling

The components use the existing SageFlow design system:
- Tailwind CSS classes
- Consistent color scheme (`text-primary`, `text-heading`, etc.)
- Responsive grid layouts
- Card-based UI components

## Error Handling

All API calls include proper error handling:
- Network errors are caught and displayed
- Validation errors show user-friendly messages
- Loading states prevent multiple submissions
- Success messages confirm data was saved

## Future Enhancements

Potential improvements for the habits system:
1. **Notifications**: Remind students to log habits daily
2. **Gamification**: Points and badges for consistent tracking
3. **Social Features**: Compare habits with peers
4. **AI Insights**: Personalized recommendations based on patterns
5. **Export**: Download habits data for external analysis
6. **Mobile App**: Native mobile experience for habit tracking

## Testing

To test the habits system:
1. Ensure backend API is running on `http://localhost:8080`
2. Create a student account and log in
3. Complete the holistic profile with habits data
4. Use the daily habits tracker to log multiple days
5. View analytics in the habits dashboard
6. Verify data persistence across sessions

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check if backend is running
   - Verify API base URL in `src/services/api.ts`
   - Check network connectivity

2. **Data Not Loading**
   - Verify user authentication
   - Check browser console for errors
   - Ensure student ID is properly set

3. **Form Validation Errors**
   - Check required field values
   - Verify data types match API expectations
   - Review browser console for validation messages

### Debug Mode

Enable debug logging by adding to browser console:
```typescript
localStorage.setItem('debug', 'true')
```

This will show detailed API request/response information.

## Support

For technical support or questions about the habits tracking system:
1. Check the browser console for error messages
2. Review the API documentation
3. Verify data format matches expected schemas
4. Test with sample data to isolate issues
