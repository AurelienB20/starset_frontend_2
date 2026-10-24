# Starset — mobile app

Starset is a mobile app that connects clients with independent service providers
(babysitting, courier and other trades). Clients find a provider by trade or nearby, book a
service, pay in the app and chat with the provider; providers manage their offers,
availability, missions and payouts.

This repository is the mobile app (Expo / React Native, iOS and Android). The API is a
separate Node.js and PostgreSQL service.

## Features

- **Two roles in one app:** client and provider, each with its own tabs.
- **Finding a provider:** search by trade, filters, providers nearby on a map (Google Maps,
  Places autocomplete).
- **Booking:** availability and calendar, one or several services per booking, summary,
  history and ratings.
- **Payments:** Stripe in the app; providers are onboarded to Stripe to receive payouts.
- **Real time:** chat over Socket.IO, push notifications (Expo Notifications).
- **Provider onboarding:** professional or individual profile, identity and mandatory
  documents, camera and document upload.
- **AI, through the API (Mistral):** MIRA, an in-app assistant that keeps the conversation's
  context, and a questionnaire that suggests the trades matching a provider's situation and
  certifications (`mistral-small-latest`).

## Stack

Expo SDK 54 · React Native 0.81 · TypeScript · Expo Router · Stripe React Native ·
Socket.IO · React Native Maps · Expo Notifications · EAS Build

## Structure

- `app/`: screens (Expo Router); `(tabs)` for clients, `(tabs_worker)` for providers
- `components/`, `context/`, `hooks/`, `constants/`
- `config.json`: the API URL (`backendUrl`)

## Run

```bash
npm install
npx expo run:android   # a development build: Stripe and maps need native modules
```

## Team

Built by [Aurélien Benoit](https://github.com/AurelienB20) and [Uneishi](https://github.com/Uneishi).
In development (version 1.0.15).
