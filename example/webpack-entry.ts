import {createApp, defineComponent, onMounted, ref} from 'vue'
import QrcodeVue from '../src';

const App = defineComponent({
  components: { QrcodeVue },
  setup() {
    const value = ref('https://example.com')
    const size = ref(100)
    const level = ref<'L' | 'M' | 'Q' | 'H'>('L')
    const background = ref('#ffffff')
    const foreground = ref('#000000')
    const renderAs = ref<'canvas' | 'svg'>('svg')
    const margin = ref(0)

    const stargazersCount = ref(290)

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
      stargazersCount,
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
