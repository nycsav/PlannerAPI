# Dark Mode Debugging Guide

## Quick Test Steps

1. Open browser DevTools (F12)
2. Check if `dark` class is on `<html>` element:
   - In Console, run: `document.documentElement.classList.contains('dark')`
3. Check localStorage:
   - In Console, run: `localStorage.getItem('theme')`
4. Manually toggle:
   - In Console, run: `document.documentElement.classList.toggle('dark')`
   - This should immediately switch the theme if Tailwind is working

## Expected Behavior

- Clicking the toggle should:
  1. Add/remove `dark` class from `<html>` element
  2. Update localStorage with 'light' or 'dark'
  3. All components with `dark:` classes should update

## Common Issues

1. **Tailwind not recognizing dark mode**: Check `tailwind.config.js` has `darkMode: 'class'`
2. **CSS not compiled**: Run `npm run build` or restart dev server
3. **Class not applied**: Check if `document.documentElement.classList` contains 'dark'
