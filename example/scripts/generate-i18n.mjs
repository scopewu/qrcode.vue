import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const i18nDir = path.join(root, 'i18n')
const templatePath = path.join(root, 'templates', 'base.html')
const outputDir = path.join(root, '.generated')

fs.mkdirSync(outputDir, { recursive: true })

const baseTemplate = fs.readFileSync(templatePath, 'utf-8')

const langFiles = fs.readdirSync(i18nDir).filter(f => f.endsWith('.ts') && f !== 'index.ts')
const langs = langFiles.map(f => f.replace(/\.ts$/, ''))

const translations = {}
for (const lang of langs) {
  const mod = await import(path.join(i18nDir, `${lang}.ts`))
  translations[lang] = mod.default
}

const langConfig = {
  en: { htmlLang: 'en', path: '/', canonical: 'https://qr-vue.tie.pub/' },
  zh: { htmlLang: 'zh-CN', path: '/zh/', canonical: 'https://qr-vue.tie.pub/zh/' },
  'zh-hk': { htmlLang: 'zh-HK', path: '/zh-hk/', canonical: 'https://qr-vue.tie.pub/zh-hk/' },
}

function t(lang, key) {
  const keys = key.split('.')
  let value = translations[lang]
  for (const k of keys) {
    value = value?.[k]
  }
  return typeof value === 'string' ? value : key
}

function generateHreflangs(currentLang) {
  const links = []
  for (const lang of langs) {
    const cfg = langConfig[lang]
    if (!cfg) continue
    const hreflang = lang === 'en' ? 'en' : cfg.htmlLang
    links.push(`  <link rel="alternate" hreflang="${hreflang}" href="${cfg.canonical}" />`)
  }
  links.push(`  <link rel="alternate" hreflang="x-default" href="https://qr-vue.tie.pub/" />`)
  return links.join('\n')
}

for (const lang of langs) {
  const cfg = langConfig[lang]
  if (!cfg) {
    console.warn(`No config for language: ${lang}, skipping.`)
    continue
  }

  let html = baseTemplate

  html = html.replace(/\{\{lang\}\}/g, cfg.htmlLang)
  html = html.replace(/\{\{canonical\}\}/g, cfg.canonical)
  html = html.replace(/\{\{hreflangs\}\}/g, generateHreflangs(lang))

  html = html.replace(/\{\{\s*t\('([^']+)'\)\s*\}\}/g, (_, key) => {
    return t(lang, key)
  })

  const outputFile = path.join(outputDir, `webpack.${lang}.html`)
  fs.writeFileSync(outputFile, html)
  console.log(`Generated: ${outputFile}`)
}

console.log('All i18n templates generated successfully.')
