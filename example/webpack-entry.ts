import { computed, createApp, defineComponent, onMounted, ref } from 'vue'
import QrcodeVue from '../src'
import type { Level, RenderAs, GradientType, ImageSettings } from '../src'
import './styles.css'

const App = defineComponent({
  components: { QrcodeVue },
  setup() {
    const value = ref('QRCODE.VUE ❤️ Thanks. 感谢. ありがたい. 감사. Reconnaissant. Dankbar. berterima kasih.')
    const size = ref(135)
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

    const stargazersCount = ref(800)

    const usageExample = computed(() => {
      let _ = ''

      if (renderAs.value === 'svg') {
        _ += 'import { QrcodeSvg } from \'qrcode.vue\''
      } else {
        _ += 'import { QrcodeCanvas } from \'qrcode.vue\''
      }

      _+= `

<${renderAs.value === 'svg' ? 'qrcode-svg' : 'qrcode-canvas'}
  :value="${value.value}"
  :size="${size.value}"
  :level="${level.value}"
  :background="${background.value}"
  :foreground="${foreground.value}"
  :render-as="${renderAs.value}"
  :margin="${margin.value}"
`

      if (gradient.value) {
        _ += `  :gradient-type="${gradientType.value}"
  :gradient-start-color="${gradientStartColor.value}"
  :gradient-end-color="${gradientEndColor.value}"
`
      }

      if (includeImage.value) {
        _ += `  :image-settings="{
      src: '${imageSettings.value.src}',
      width: ${imageSettings.value.width},
      height: ${imageSettings.value.height},
      excavate: ${imageSettings.value.excavate},
      borderRadius: ${imageSettings.value.borderRadius}
  }"
`
      }

      _ += `/>`

      return _
    })
    const rows = computed(() => {
      const lineBreaks = usageExample.value.match(/\n/g)
      return lineBreaks ? lineBreaks.length + 1 : 1
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
      rows,
    }
  }
})

createApp(App).mount('#root')

function fetchGitHubRepoStarCount(callback: Function) {
  const repo = 'https://api.github.com/repos/scopewu/qrcode.vue'

  try {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(JSON.parse(xhr.response))
      }
    }

    xhr.onerror = function (ev) {
      console.log(ev)
      callback({})
    }

    xhr.open('GET', repo)
    xhr.withCredentials = false
    xhr.send();
  } catch (e) {
    console.log(e)
    callback({})
  }
}
