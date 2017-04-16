import Vue from 'vue';
import QrcodeVue from '../dist/qrcode.vue.min';

Vue.config.productionTip = false;

new Vue({
  el: '#root',
  data: {
    value: 'https://example',
    size: 100,
    level: 'L',
    background: '#ffffff',
    foreground: '#000000'
  },
  template: `<div><ul>
  <li>
  <label>Value: 
  <textarea v-model="value" cols="50" rows="5"></textarea>
  </label>
  </li>
  <li><label>Size: 
  <input type="range" v-model="size" min="100" max="800"></label></li>
  <li><label>Level: 
  <select v-model="level">
  <option value="L">L</option>
  <option value="Q">Q</option>
  <option value="M">M</option>
  <option value="H">H</option>
  </select>
  </label>
  </li>
  <li><label>Background: <input type="color" v-model="background"></label></li>
  <li><label>Foreground: <input type="color" v-model="foreground"></label></li>
  </ul>
  <h2>QR_CODE:</h2>
  <qrcode-vue className="qrcode" :value="value" :size="size" :level="level" :background="background" :foreground="foreground" /></div>`,
  components: {
    QrcodeVue
  }
})
