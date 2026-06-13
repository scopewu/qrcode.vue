import { computed, createApp, defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import QrcodeVue from '../src'
import type { Level, RenderAs, GradientType, ImageSettings } from '../src'
import { getLang, t, LANGUAGES } from './i18n'
import './styles.css'

const LangSwitcher = defineComponent({
  name: 'LangSwitcher',
  setup() {
    const lang = getLang()
    const languages = LANGUAGES
    const currentLabel = LANGUAGES.find(l => l.key === lang)?.label ?? ''

    return { lang, languages, currentLabel, t }
  },
  template: `
    <div class="lang-dropdown">
      <button type="button" class="lang-trigger"
        aria-haspopup="true"
        :aria-label="t('langSwitcher.label')">
        <svg class="lang-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span class="lang-current">{{ currentLabel }}</span>
        <svg class="lang-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
      <ul class="lang-menu" role="menu" :aria-label="t('langSwitcher.label')">
        <li v-for="l in languages" :key="l.key" role="none">
          <a :href="l.href" class="lang-option" :class="{ 'lang-option-active': l.key === lang }"
            role="menuitem" :lang="l.htmlLang" :aria-current="l.key === lang ? 'true' : undefined">
            <svg class="lang-check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <span>{{ l.label }}</span>
          </a>
        </li>
      </ul>
    </div>
  `,
})

const App = defineComponent({
  components: { QrcodeVue, LangSwitcher },
  setup() {
    const value = ref(t('defaultValue'))
    const size = ref(220)
    const level = ref<Level>('L')
    const background = ref('#ffffff')
    const foreground = ref('#000000')
    const renderAs = ref<RenderAs>('svg')
    const margin = ref(0)
    const includeImage = ref(true)
    const imageSettings = ref<ImageSettings>({
      src: 'https://github.com/scopewu.png',
      width: 30,
      height: 30,
      // x: 10,
      // y: 10,
      excavate: true,
      borderRadius: 0,
    })
    const gradient = ref(false)
    const gradientType = ref<GradientType>('linear')
    const gradientStartColor = ref('#000000')
    const gradientEndColor = ref('#38bdf8')
    const radius = ref(0)

    const activeTab = ref<'docs' | 'playground'>('docs')
    const stargazersCount = ref(800)

    const switchTab = (tab: 'docs' | 'playground') => {
      activeTab.value = tab
      nextTick(() => {
        const tabsEl = document.querySelector<HTMLElement>('.app-main')
        if (tabsEl && window.scrollY > tabsEl.offsetTop + 30) {
          window.scrollTo({ top: tabsEl.offsetTop - 10, behavior: 'smooth' })
        }
      })
    }

    let cachedImageSettings = imageSettings.value
    watch(includeImage, (newVal) => {
      if (newVal) {
        imageSettings.value = cachedImageSettings
      } else {
        cachedImageSettings = imageSettings.value
        imageSettings.value = {
          src: '',
          width: 0,
          height: 0,
          excavate: false,
          borderRadius: 0,
        }
      }
    })

    const usageExample = computed(() => {
      let code = ''

      if (renderAs.value === 'svg') {
        code += 'import { QrcodeSvg } from \'qrcode.vue\''
      } else {
        code += 'import { QrcodeCanvas } from \'qrcode.vue\''
      }

      code += `

<${renderAs.value === 'svg' ? 'qrcode-svg' : 'qrcode-canvas'}
  value="${value.value}"
  :size="${size.value}"
  level="${level.value}"
  background="${background.value}"
  foreground="${foreground.value}"
  :margin="${margin.value}"
  :radius="${radius.value}"
`

      if (gradient.value) {
        code += `  :gradient="${gradient.value}"
  gradient-type="${gradientType.value}"
  gradient-start-color="${gradientStartColor.value}"
  gradient-end-color="${gradientEndColor.value}"
`
      }

      if (includeImage.value) {
        const crossOriginLine = imageSettings.value.crossOrigin
          ? `,\n      crossOrigin: '${imageSettings.value.crossOrigin}'`
          : ''
        code += `  :image-settings="{
      src: '${imageSettings.value.src}',
      width: ${imageSettings.value.width},
      height: ${imageSettings.value.height},
      excavate: ${imageSettings.value.excavate},
      borderRadius: ${imageSettings.value.borderRadius}${crossOriginLine}
  }"
`
      }

      code += '/>'

      return code
    })

    onMounted(() => {
      fetchGitHubRepoStarCount((repoDetail: any) => {
        const { stargazers_count } = repoDetail

        if (typeof stargazers_count === 'number') {
          stargazersCount.value = stargazers_count
        }
      })
    })

    return {
      activeTab,
      switchTab,
      value,
      size,
      level,
      background,
      foreground,
      renderAs,
      margin,
      includeImage,
      imageSettings,
      stargazersCount,
      gradient,
      gradientType,
      gradientStartColor,
      gradientEndColor,
      usageExample,
      radius,
      t,
    }
  }
})

createApp(App).mount('#root')

function fetchGitHubRepoStarCount(callback: (detail: unknown) => void) {
  const repo = 'https://api.github.com/repos/scopewu/qrcode.vue'

  try {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(JSON.parse(xhr.responseText))
      }
    }

    xhr.onerror = function (ev) {
      console.error(ev)
      callback({})
    }

    xhr.open('GET', repo)
    xhr.withCredentials = false
    xhr.send();
  } catch (e) {
    console.error(e)
    callback({})
  }
}
