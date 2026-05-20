import en from './en'
import zh from './zh'
import zhHk from './zh-hk'

const messages: Record<string, typeof en> = {
  en,
  zh,
  'zh-hk': zhHk,
}

export interface LangOption {
  key: string
  label: string
  href: string
  htmlLang: string
}

export const LANGUAGES: LangOption[] = [
  { key: 'en', label: en.langSwitcher.en, href: '/', htmlLang: 'en' },
  { key: 'zh', label: zh.langSwitcher.zh, href: '/zh/', htmlLang: 'zh-CN' },
  { key: 'zh-hk', label: zhHk.langSwitcher['zh-hk'], href: '/zh-hk/', htmlLang: 'zh-HK' },
]

export function getLang(): string {
  const htmlLang = document.documentElement.lang
  if (htmlLang === 'zh-HK' || htmlLang === 'zh-Hant') return 'zh-hk'
  if (htmlLang === 'zh-CN' || htmlLang === 'zh') return 'zh'
  return 'en'
}

export function t(key: string): string {
  const lang = getLang()
  const msg = messages[lang]
  const keys = key.split('.')
  let value: unknown = msg

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
}
