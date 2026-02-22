# Mobile QA Checklist

Run this before each release on:
- iPhone Safari (browser)
- iPhone standalone PWA
- Android Chrome

## Navigation and layout
- [ ] Sidebar desktop transitions do not affect mobile layout
- [ ] Bottom nav active state is always correct
- [ ] FAB never overlaps tappable content
- [ ] No horizontal overflow on any protected route

## Keyboard and scroll behavior
- [ ] Focusing inputs does not trigger unwanted page jumping
- [ ] Wizard step transitions keep CTA location stable
- [ ] No accidental pull-to-refresh in standalone mode
- [ ] Content remains reachable with on-screen keyboard open

## Performance perception
- [ ] Menu tap to route content feels instant on warm nav
- [ ] Loading placeholders appear quickly for slow network
- [ ] No visible jank during first interaction after page open
