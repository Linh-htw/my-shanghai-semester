# Mein Shanghai-Semester — Prototyp

Dies ist ein Frontend-Prototyp für ein privates Fotoportal.

## Lokal öffnen

Öffne `index.html` in einem Browser. Solange keine Supabase-Zugangsdaten in
`supabase-config.js` hinterlegt sind, läuft die Galerie im lokalen Prototyp-Modus.

## Was funktioniert

- Chronologisches Fotoarchiv nach Monaten
- Kategorien-Filter
- Foto-Lightbox mit Beschreibung, Datum und Ort
- Privat wirkender Admin-Bereich
- Lokaler Foto-Upload inklusive Beschreibung, Datum, Ort und Kategorie
- Hochgeladene Inhalte werden im `localStorage` des Browsers gespeichert (Prototyp-Modus)

## Veröffentlichung mit gemeinsamem Fotoarchiv

Die Dateien für die veröffentlichbare Version sind vorbereitet:

1. Ein Supabase-Projekt anlegen und in dessen SQL Editor den Inhalt von
   `supabase/schema.sql` ausführen.
2. Unter **Authentication → Providers → Email** E-Mail-Login aktivieren und
   einen Benutzer für den Admin-Zugang anlegen.
3. Unter **Project Settings → API** Projekt-URL und **anon/public key** in
   `supabase-config.js` eintragen. Niemals den `service_role`-Schlüssel eintragen.
4. Die Dateien anschließend z. B. über Vercel veröffentlichen.

Nach der Einrichtung sehen Besucher die gemeinsame Galerie über den Link.
Der Admin-Bereich verlangt eine Anmeldung; neue Uploads werden im zentralen
Supabase-Speicher abgelegt.

## Wichtig

Der Standard in `supabase/schema.sql` erlaubt allen angemeldeten Supabase-
Benutzern Uploads. Deshalb sollte in Supabase die Selbstregistrierung deaktiviert
bleiben und nur dein Admin-Konto existieren.
