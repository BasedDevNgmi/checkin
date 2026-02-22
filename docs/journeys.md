# Core User Journeys

## 1) New user onboarding
1. User opens `/`
2. User signs up or uses magic link
3. User is redirected to `/dashboard`
4. User starts first check-in at `/checkin`

Recovery path:
- Invalid credentials -> inline message with retry action
- Expired link -> request a new link from login screen

## 2) Daily check-in loop
1. User opens app and lands on `/dashboard`
2. User starts check-in
3. User submits and returns to dashboard with latest item visible
4. User can inspect detail from timeline

Recovery path:
- Offline save -> queue and sync on reconnect with clear status

## 3) Insight review loop
1. User opens `/analytics`
2. User changes period
3. User reviews trends and key insights

Recovery path:
- Low data density -> show contextual guidance and empty-state message
