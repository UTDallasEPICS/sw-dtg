# Homepage Implementation Plan

## Overview
Create a new `app/pages/homepage.vue` with two functional buttons (Teacher and Student). The buttons display a toast notification and do NOT navigate anywhere. A simple link to the homepage will be added from the existing `index.vue`.

## Steps

1. **Create `app/pages/homepage.vue`**
   - Use existing Nuxt UI components (`UButton`, `UCard`, `UContainer`)
   - Add two buttons: "Teacher" and "Student"
   - Each button uses `useToast()` to display a toast: "Teacher page coming soon" / "Student page coming soon"
   - Buttons do NOT navigate to `/teacher` or `/student` pages

2. **Update `app/pages/index.vue`**
   - Add a simple link/button to navigate to `/homepage`

3. **No other changes**
   - `/teacher` and `/student` routes left for future implementation
   - Auth middleware remains unchanged

## Files to Create/Modify
- **Create:** `app/pages/homepage.vue`
- **Modify:** `app/pages/index.vue`
