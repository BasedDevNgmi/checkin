# Experimentation Roadmap

## Goal
Improve activation and retention without hurting perceived speed.

## Initial experiments

1. **Onboarding CTA copy test**
   - Variant A: `Start met inchecken`
   - Variant B: `Start je eerste check-in`
   - Success metric: onboarding-to-first-check-in conversion

2. **Dashboard hero density test**
   - Variant A: current compact hero
   - Variant B: slightly expanded guidance block
   - Success metric: check-in starts per active day

3. **Analytics empty-state guidance test**
   - Variant A: current low-data guidance
   - Variant B: action-oriented guidance with direct check-in CTA
   - Success metric: conversion to new check-in from analytics page

## Event hooks in place

- `auth_login_success`
- `auth_signup_success`
- `auth_magic_link_sent`
- `onboarding_completed`
- `checkin_saved`
- `checkin_updated`
- `checkin_deleted`
