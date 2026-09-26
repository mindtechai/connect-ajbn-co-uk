# Events navigation update

## What will change

- Add **Events** as a top-level item in the mobile hamburger menu, between **Directory** and **Messages**.
  - Use the existing calendar icon style.
  - Add a compact **Annual Flagship Event** badge without changing the five-item bottom navigation.
- Add a prominent linked card near the top of Dashboard Home:
  - **Annual Flagship Event – 19 Oct 10AM-4PM, London Marriott Swiss Cottage – 50 stalls, 600 guests**
  - Open the existing `/events` page when selected.
- Put an **Upcoming Events** card first on the Services page, ahead of the existing member-service cards, linking to `/events`.
- Preserve the existing Events page, notification bell, authentication, Report/Block controls, and all iPhone project files.

## Verification and release

- Check the hamburger order and event badge at phone width.
- Check the Dashboard and Services event cards link to `/events` and remain readable on mobile and desktop.
- Confirm the bottom navigation is unchanged: **Home, Directory, Messages, Services, Profile**.
- Run the project checks, resolve any errors caused by this update, then publish the verified version.

## Technical details

- Reuse the existing navigation, card, icon, and design-token patterns; no new packages or database changes.
- Keep the existing `/events` route and metadata intact.
