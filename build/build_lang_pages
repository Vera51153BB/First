# -*- coding: utf-8 -*-
# Файл: /build/build_lang_pages.py
# ------------------------------------------------------------
# Что делает:
#   • читает шаблон /index.template.html и словарь /build/i18n_index.json;
#   • генерирует /index.html (английский, x-default);
#   • генерирует /{lang}/index.html для всех языков.
#
# Запуск (на сервере или локально в корне репозитория):
#   cd /var/www/botcryptosignal
#   python3 build/build_lang_pages.py
# ------------------------------------------------------------

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_PATH = ROOT / "index.template.html"
I18N_PATH = ROOT / "build" / "i18n_index.json"

DOMAIN = "https://botcryptosignal.com"

# Порядок языков для hreflang
LANGS = ["en", "ru", "hi", "pt", "es", "uk", "de", "fr", "it", "ja", "tr", "zh"]


def load_meta() -> dict:
  data = json.loads(I18N_PATH.read_text(encoding="utf-8"))
  return data


def make_hreflang_block() -> str:
  lines: list[str] = []
  # x-default — корень
  lines.append(f'<link rel="alternate" hreflang="x-default" href="{DOMAIN}/" />')
  for code in LANGS:
    href = f"{DOMAIN}/{code}"
    lines.append(f'<link rel="alternate" hreflang="{code}" href="{href}" />')
  # Небольшой отступ, чтобы красиво легло внутри <head>
  return "\n  ".join(lines)


def build_page(
  lang: str,
  meta: dict,
  template: str,
  hreflang_block: str,
  *,
  is_root: bool,
) -> str:
  html = template

  # lang атрибут
  html = html.replace("{{lang}}", lang)

  # SEO / OG / Twitter
  html = html.replace("{{seo_title_home}}", meta["seo_title_home"])
  html = html.replace("{{seo_desc_home}}", meta["seo_desc_home"])
  html = html.replace("{{og_title_home}}", meta["og_title_home"])
  html = html.replace("{{og_desc_home}}", meta["og_desc_home"])
  html = html.replace("{{tw_title_home}}", meta["tw_title_home"])
  html = html.replace("{{tw_desc_home}}", meta["tw_desc_home"])
  html = html.replace("{{og_image_alt_home}}", meta["og_image_alt_home"])

  # URL'ы для canonical и og:url
  if is_root:
    url = f"{DOMAIN}/"
  else:
    url = f"{DOMAIN}/{lang}"
  html = html.replace("{{canonical_href}}", url)
  html = html.replace("{{og_url}}", url)

  # hreflang блок
  html = html.replace("{{hreflang_links}}", hreflang_block)

  return html


def main() -> None:
  template = TEMPLATE_PATH.read_text(encoding="utf-8")
  meta_all = load_meta()
  hreflang_block = make_hreflang_block()

  # 1) Языковые страницы /{lang}/index.html
  for lang in LANGS:
    if lang not in meta_all:
      raise SystemExit(f"Нет мета-данных для языка '{lang}' в i18n_index.json")
    meta = meta_all[lang]
    html = build_page(lang, meta, template, hreflang_block, is_root=False)

    out_dir = ROOT / lang
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "index.html"
    out_file.write_text(html, encoding="utf-8")
    print(f"[OK] {out_file}")

  # 2) Корень /index.html — x-default, английский
  default_lang = "en"
  meta = meta_all[default_lang]
  html_root = build_page(default_lang, meta, template, hreflang_block, is_root=True)
  root_file = ROOT / "index.html"
  root_file.write_text(html_root, encoding="utf-8")
  print(f"[OK] {root_file}")


if __name__ == "__main__":
  main()
