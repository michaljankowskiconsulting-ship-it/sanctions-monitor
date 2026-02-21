# 📋 Monitor Listy Sankcyjnej MSWiA

Automatyczne śledzenie zmian na [liście osób i podmiotów objętych sankcjami](https://www.gov.pl/web/mswia/lista-osob-i-podmiotow-objetych-sankcjami) publikowanej przez Ministerstwo Spraw Wewnętrznych i Administracji.

## Jak to działa

```
GitHub Actions (cron 4×/dzień)
  ↓
Skrypt Python pobiera XLSX z gov.pl
  ↓
Porównuje z poprzednią wersją (JSON w repo)
  ↓
Jeśli zmiana → generuje diff → commituje → wysyła email
  ↓
Push triggeruje rebuild → Vercel deployuje nową wersję strony
```

## Funkcje

- **Monitoring 4× dziennie** (00:00, 06:00, 12:00, 18:00 UTC)
- **Wykrywanie zmian**: dodane/usunięte/zmodyfikowane wpisy
- **Powiadomienia email** przy każdej zmianie
- **Strona www** z aktualną listą, historią zmian i wyszukiwarką
- **Pełna historia** w git (każda zmiana = commit)
- **Darmowe** – GitHub Actions + Vercel free tier

## Szybki start

### 1. Stwórz repo na GitHub

```bash
# Sklonuj lub skopiuj ten folder do nowego repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TWOJ-USER/sanctions-monitor.git
git push -u origin main
```

### 2. Skonfiguruj email (GitHub Secrets)

W repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Wartość | Przykład |
|--------|---------|----------|
| `SMTP_HOST` | Serwer SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Port | `587` |
| `SMTP_USER` | Login | `twoj@gmail.com` |
| `SMTP_PASS` | Hasło aplikacji* | `abcd efgh ijkl mnop` |
| `EMAIL_TO` | Adres odbiorcy | `compliance@firma.pl` |
| `EMAIL_FROM` | Nadawca (opcjonalnie) | `monitor@firma.pl` |

> *Dla Gmaila: [Utwórz hasło aplikacji](https://myaccount.google.com/apppasswords)
> (wymaga włączonego 2FA na koncie Google)

### 3. Skonfiguruj Vercel

#### Opcja A: Automatyczny deploy z Vercel CLI
```bash
npm i -g vercel
vercel link        # połącz z projektem
vercel --prod      # pierwszy deploy
```

Potem w GitHub Secrets dodaj:
- `VERCEL_TOKEN` – z https://vercel.com/account/tokens
- `VERCEL_ORG_ID` – z pliku `.vercel/project.json`
- `VERCEL_PROJECT_ID` – z pliku `.vercel/project.json`

#### Opcja B: Bezpośredni import w Vercel (prostsze)
1. Wejdź na https://vercel.com/new
2. Zaimportuj repo z GitHub
3. Vercel automatycznie wykryje Next.js
4. Kliknij Deploy

W tej opcji możesz usunąć plik `.github/workflows/deploy.yml` –
Vercel sam zrobi redeploy przy każdym pushu.

### 4. Uruchom pierwszy skan

W repo → Actions → "Monitor Sanctions List" → Run workflow

Lub poczekaj na najbliższy zaplanowany czas (00/06/12/18 UTC).

### 5. Gotowe! ✅

## Struktura plików

```
sanctions-monitor/
├── .github/workflows/
│   ├── monitor.yml          # Cron 4×/dzień – pobiera dane
│   └── deploy.yml           # Deploy na Vercel po zmianie danych
├── scripts/
│   ├── monitor.py           # Główny skrypt monitorujący
│   └── requirements.txt     # Zależności Pythona
├── data/                    # Dane (commitowane do repo = baza danych)
│   ├── current.json         # Aktualna lista (sparsowana)
│   ├── current.xlsx         # Oryginalny plik XLSX
│   ├── changelog.json       # Historia zmian
│   └── meta.json            # Metadane (hash, daty)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── SanctionsApp.tsx  # Główny komponent UI
│   └── lib/
│       └── data.ts           # Ładowanie danych z JSON
├── package.json
├── next.config.js
└── README.md
```

## FAQ

**Dlaczego dane trzymane w repo a nie w bazie danych?**
Bo to najprostsze i darmowe rozwiązanie. Git daje historię zmian za darmo,
GitHub Actions daje cron za darmo, Vercel daje hosting za darmo.
Dla listy ~600 wpisów JSON jest idealny.

**Czy mogę zmienić częstotliwość sprawdzania?**
Tak, edytuj cron w `.github/workflows/monitor.yml`.
Np. co godzinę: `0 * * * *`

**Co jeśli strona MSWiA zmieni strukturę?**
Skrypt parsuje XLSX (nie HTML), więc jest odporny na zmiany layoutu strony.
Jeśli zmienią URL do pliku XLSX, `fetch_xlsx_url()` automatycznie
szuka linku na stronie. Jeśli zmienią format XLSX, trzeba będzie
dostosować `parse_xlsx()`.

**Ile kosztuje?**
0 zł. GitHub Actions: 2000 min/mies (free tier, zużyjesz ~30 min/mies).
Vercel: darmowy plan wystarczy.

## Licencja

MIT
