# Homepage

## Overview
The homepage serves as a selection landing page for users to choose between Teacher and Student roles. It provides entry points for future role-specific functionality while currently showing placeholder notifications.

## Route
- Path: `/homepage`
- File: `app/pages/homepage.vue`

## Features
- **Title**: Displays "Stronger Twister"
- **Teacher Button**: Shows a toast notification "Teacher page coming soon" when clicked
- **Student Button**: Shows a toast notification "Student page coming soon" when clicked
- No navigation occurs from either button

## Components Used
- `UContainer` - Layout container
- `UButton` - Action buttons for Teacher and Student roles

## Implementation Details
The page uses `useToast()` from Nuxt UI to display notifications. Both buttons are styled differently (primary for Teacher, secondary for Student) and arranged responsively in a flex layout.

## Navigation
Users can access the homepage from the Dashboard (`/`) via the "Homepage" button in the top navigation bar.
