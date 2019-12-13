import Vue from 'vue'
import QrcodeVue from '../../src'

import './app.css'

Vue.config.productionTip = false

new Vue({
  el: '#root',
  components: {
    QrcodeVue,
  },
  data: {
    value: 'https://example.com',
    size: 100,
    level: 'L',
    background: '#ffffff',
    foreground: '#000000',
    renderAs: 'svg',
  },
  template: `<form class="form-horizontal">
      <div class="form-group">
        <label class="col-sm-2 control-label">Value:</label>
        <div class="col-sm-10">
          <textarea v-model="value" class="form-control" rows="3"></textarea>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Size:</label>
        <div class="col-sm-10">
          <div class="form-control-static">
            <input type="range" v-model="size" min="100" max="800" step="20">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Level:</label>
        <div class="col-sm-10">
          <select v-model="level" class="form-control">
            <option value="L">L</option>
            <option value="Q">Q</option>
            <option value="M">M</option>
            <option value="H">H</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">renderAs:</label>
        <div class="col-sm-10">
          <select v-model="renderAs" class="form-control">
            <option value="svg">svg</option>
            <option value="canvas">canvas</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Background:</label>
        <div class="col-sm-10">
          <div class="form-control-static">
            <input type="color" v-model="background">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Foreground:</label>
        <div class="col-sm-10">
          <div class="form-control-static">
            <input type="color" v-model="foreground">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">QR_CODE:</label>
        <div class="col-sm-10">
          <div class="form-control-static">
            <qrcode-vue class="qrcode" :value="value" :renderAs="renderAs" :size="size" :level="level" :background="background" :foreground="foreground"/>
          </div>
        </div>
      </div>
    </form>`,
})
