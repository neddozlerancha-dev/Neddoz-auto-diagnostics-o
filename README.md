# Neddoz Auto Diagnostics V2

A mobile-friendly, free-first automotive learning and diagnostic reference platform built with React + Vite. Designed for deployment to Vercel.

## Included modules
- Dashboard and quick access
- Generic fault-code lookup with symptoms, possible causes and diagnostic steps
- Sensor/component library with locally stored illustrative sensor images
- ECU programming preparation, coding/adaptation concepts, hardware checklist and legitimate references
- Starter vehicle profile/database
- General repair workflow checklist
- Guided symptom diagnosis
- OBD-II live-data learning guide (reference only; no live vehicle connection)
- Maintenance planning checklist
- Tools and automotive glossary search

## Run locally
1. Install Node.js (LTS).
2. Extract this ZIP and open the project folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. For production, run `npm run build`; Vite outputs `dist/`.

## Deploy on Vercel
Import the project repository into Vercel. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.

## Important limits
This is an educational reference platform, not a connected diagnostic scanner. It does not read vehicle ECUs, decode VINs, provide a complete OEM service database, supply verified wiring diagrams/calibration files, or flash/program control modules. Sensor images are illustrative; confirm exact components and procedures for the specific make, model, year, engine and VIN. ECU programming requires compatible licensed software/hardware, authorized data, stable power and a vehicle-specific procedure. Never use the platform as a substitute for safety training or manufacturer service information.


## Installable web app (PWA)
This build includes a web app manifest, icons and a basic service worker. Deploy it over HTTPS first. On Android Chrome, open the deployed URL, tap the browser menu, then choose **Install app** or **Add to Home screen** (the wording varies). Offline use is limited to assets already cached; scanner features still need a compatible adapter and supported browser.

## Publish the website on Vercel (phone-friendly)
1. Extract this ZIP on your phone or computer.
2. Upload the project folder to a new GitHub repository.
3. In Vercel, choose **Add New → Project**, import the repository, and deploy.
4. Framework: Vite; Build command: `npm run build`; Output directory: `dist`.
5. Open the HTTPS deployment link to test it.

## Android APK route
This ZIP is an installable PWA project, not a compiled APK. After the website is deployed to HTTPS, use https://www.pwabuilder.com/ to package the live site for Android, review its checks, and build an APK/AAB. Test the resulting package on a real device before sharing it. A Play Store release typically uses an Android App Bundle (AAB), signing, and Play Console setup.

## Important limitations
This is a reference/learning interface, not a substitute for a professional scan tool. Bluetooth device selection does not guarantee OBD-II communication; actual scan/read/clear/live-data features need a supported adapter protocol implementation and vehicle-specific validation.
