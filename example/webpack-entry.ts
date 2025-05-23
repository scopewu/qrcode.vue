import { createApp, defineComponent, onMounted, ref } from 'vue'
import QrcodeVue from '../src'
import type { Level, RenderAs, GradientType, ImageSettings } from '../src'
import './styles.scss'

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
    const imageSettings = ref<ImageSettings>({
      src: 'https://github.com/scopewu.png',
      width: 30,
      height: 30,
      // x: 10,
      // y: 10,
      excavate: true,
    })
    const gradient = ref(false)
    const gradientType = ref<GradientType>('linear')
    const gradientStartColor = ref('#000000')
    const gradientEndColor = ref('#38bdf8')

    const stargazersCount = ref(750)

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
      imageSettings,
      stargazersCount,
      gradient,
      gradientType,
      gradientStartColor,
      gradientEndColor,
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
    xhr.send();
  } catch (e) {
    console.log(e)
    callback({})
  }
}
