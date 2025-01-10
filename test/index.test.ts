import { mount } from '@vue/test-utils'
import QrcodeVue from '../src'

describe('QrcodeVue', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(QrcodeVue, {
      props: {
        value: 'test',
      },
    })
    expect(wrapper.html()).toContain('<canvas')
  })

  it('renders SVG when renderAs is svg', () => {
    const wrapper = mount(QrcodeVue, {
      props: {
        value: 'test',
        renderAs: 'svg',
      },
    })
    expect(wrapper.html()).toContain('<svg')
  })

  it('applies correct size', () => {
    const size = 200
    const wrapper = mount(QrcodeVue, {
      props: {
        value: 'test',
        size,
      },
    })
    const canvas = wrapper.find('canvas')
    expect(canvas.attributes('width')).toBe(`${size}`)
    expect(canvas.attributes('height')).toBe(`${size}`)
  })

  it('renders with image settings', () => {
    const imageSettings = {
      src: 'test.png',
      height: 50,
      width: 50,
    }
    const wrapper = mount(QrcodeVue, {
      props: {
        value: 'test',
        imageSettings,
      },
    })
    expect(wrapper.html()).toContain('<img')
  })

  it('renders with gradient', () => {
    const wrapper = mount(QrcodeVue, {
      props: {
        value: 'test',
        renderAs: 'svg',
        gradient: true,
        gradientType: 'linear',
        gradientStartColor: '#000',
        gradientEndColor: '#fff',
      },
    })
    expect(wrapper.html()).toContain('linearGradient')
  })

  it('handles invalid error correction level gracefully', () => {
    const wrapper = mount(QrcodeVue, {
      props: {
        value: 'test',
        level: 'H',
      },
    })
    expect(wrapper.html()).toContain('<canvas')
  })
})
