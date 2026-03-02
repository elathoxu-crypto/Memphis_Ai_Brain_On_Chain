# Project Task: Install Memphis on Second PC (Ubuntu + GTX 1060)

## Cel
Przenieść Memphis na drugi komputer z Ubuntu i GPU (GTX 1060 3 GB), zsynchronizować pamięć oraz przygotować Style (OpenClaw) do pracy z modelem `o3:mini`. Zapewnić backupy i offline toggle oraz dokumentację sekretów wyłącznie w TUI.

## Checklist
- [ ] System i środowisko
  - [ ] `sudo apt update && sudo apt upgrade`
  - [ ] Installer packages: `build-essential curl git python3 python3-pip zip unzip` + `nvidia-drivers`
  - [ ] `ubuntu-drivers autoinstall` + restart
- [ ] GPU/CUDA
  - [ ] Zweryfikować CUDA compatibility (np. CUDA 12) i zainstalować toolchain
  - [ ] Uruchomić `nvidia-smi` i `nvcc --version`
- [ ] Repo i zależności Memphis
  - [ ] `git clone https://github.com/openclaw/memphis.git ~/memphis`
  - [ ] Uruchomić `npm install`/`pip install -r requirements` etc.
  - [ ] Skonfigurować `.memphis` (przenieść folder z głównego PC lub init)
- [ ] Model lokalny i offline toggle
  - [ ] Zainstalować Ollama lub lokalny LLM kompatybilny z GTX 1060
  - [ ] Ustawić **`qwen2.5-coder:3b` jako primary model** w memphis (dostępny lokalnie przez Ollama) i zachować `o3:mini` jako fallback dla Style w OpenClaw
  - [ ] Dodać w TUI opcję offline (toggle) z dokumentacją w `project_task`/`ops`
- [ ] Synchronizacja pamięci
  - [ ] Rsync `~/.memphis/chains` i `~/memphis/memory` (lub odpowiedniki) z głównego PC
  - [ ] Zweryfikować integralność (memphis status, recall)
  - [ ] Wprowadzić rolę `Style` w pamięci z tagami `agent:style`, `model:o3-mini`
- [ ] Vault i bezpieczeństwo
  - [ ] Skonfigurować vault, dodać root policy (TUI-only secrets)
  - [ ] Zaimportować klucze/SSI zgodnie z polityką
  - [ ] Dodać przypomnienie w `ops`/`journal` o rotacji kluczy
- [ ] Monitoring i backup
  - [ ] Uruchomić watchdog (cron `memphis status` + `ops` logs)
  - [ ] Spakować backupy (zip/rsync) i dodać manifest
  - [ ] Przekazać zestaw (notes, memory) via paczka deployment

## Tagi
`project_task`, `deployment`, `ubuntu`, `security`, `linux`, `style-role`

## Uwaga
Po instalacji zadbaj, by Style (obie instancje) miały spójne tagi w pamięci i że wszystkie sekrety są obsługiwane przez TUI vault. OpenClaw służy do narracji i orchestracji.
