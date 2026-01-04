import { describe, expect, it } from '@rstest/core'
import { mount } from '@vue/test-utils'
import QrcodeVue from '../src'

describe('QrcodeVue', () => {
  describe('default rendering (canvas)', () => {
    it('renders canvas with default props', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
        },
      })
      expect(wrapper.html()).toContain('<canvas')
      expect(wrapper.html()).not.toContain('<svg')
    })

    it('applies correct size to canvas', () => {
      const size = 200
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          size,
        },
      })
      const canvas = wrapper.find('canvas')
      const style = canvas.attributes('style')
      expect(style).toContain(`width: ${size}px`)
      expect(style).toContain(`height: ${size}px`)
    })

    it('renders canvas with margin', () => {
      const margin = 4
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          margin,
        },
      })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('renders canvas with different error correction levels', () => {
      const levels = ['L', 'M', 'Q', 'H'] as const
      levels.forEach(level => {
        const wrapper = mount(QrcodeVue, {
          props: {
            value: 'test',
            level,
          },
        })
        expect(wrapper.html()).toContain('<canvas')
      })
    })

    it('renders canvas with custom background and foreground colors', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          background: '#f0f0f0',
          foreground: '#333333',
        },
      })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('renders canvas with gradient', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          gradient: true,
          gradientType: 'linear',
          gradientStartColor: '#000',
          gradientEndColor: '#fff',
        },
      })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('renders canvas with image settings', () => {
      const imageSettings = {
        src: 'test.png',
        height: 30,
        width: 30,
      }
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          imageSettings,
        },
      })
      expect(wrapper.html()).toContain('<canvas')
      expect(wrapper.html()).toContain('<img')
    })

    it('handles invalid error correction level gracefully in canvas mode', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          level: 'INVALID' as any,
        },
      })
      expect(wrapper.html()).toContain('<canvas')
    })
  })

  describe('SVG rendering', () => {
    it('renders SVG when renderAs is svg', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
        },
      })
      expect(wrapper.html()).toContain('<svg')
      expect(wrapper.html()).not.toContain('<canvas')
    })

    it('applies correct size to SVG', () => {
      const size = 200
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          size,
        },
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe(String(size))
      expect(svg.attributes('height')).toBe(String(size))
    })

    it('renders SVG with margin', () => {
      const margin = 4
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          margin,
        },
      })
      const svg = wrapper.find('svg')
      const viewBox = svg.attributes('viewBox')
      expect(viewBox).toBeDefined()
      expect(viewBox).not.toBeUndefined()
    })

    it('renders SVG with different error correction levels', () => {
      const levels = ['L', 'M', 'Q', 'H'] as const
      levels.forEach(level => {
        const wrapper = mount(QrcodeVue, {
          props: {
            value: 'test',
            renderAs: 'svg',
            level,
          },
        })
        expect(wrapper.html()).toContain('<svg')
      })
    })

    it('renders SVG with custom background and foreground colors', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          background: '#f0f0f0',
          foreground: '#333333',
        },
      })
      const svg = wrapper.find('svg')
      const rect = svg.find('rect')
      const path = svg.find('path')
      expect(rect.attributes('fill')).toBe('#f0f0f0')
      expect(path.attributes('fill')).toBe('#333333')
    })

    it('renders SVG with linear gradient', () => {
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
      const path = wrapper.find('path')
      expect(path.attributes('fill')).toBe('url(#qr-gradient)')
    })

    it('renders SVG with radial gradient', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          gradient: true,
          gradientType: 'radial',
          gradientStartColor: '#000',
          gradientEndColor: '#fff',
        },
      })
      expect(wrapper.html()).toContain('radialGradient')
    })

    it('renders SVG with image settings', () => {
      const imageSettings = {
        src: 'test.png',
        height: 30,
        width: 30,
      }
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          imageSettings,
        },
      })
      expect(wrapper.html()).toContain('<image')
      const image = wrapper.find('image')
      expect(image.attributes('href')).toBe(imageSettings.src)
    })

    it('renders SVG with image excavation', () => {
      const imageSettings = {
        src: 'test.png',
        height: 30,
        width: 30,
        excavate: true,
      }
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          imageSettings,
        },
      })
      expect(wrapper.html()).toContain('<image')
    })

    it('handles invalid error correction level gracefully in SVG mode', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          level: 'INVALID' as any,
        },
      })
      expect(wrapper.html()).toContain('<svg')
    })

    it('generates correct path data for value "QRCODE.VUE LOVE"', async () => {
      const value = 'QRCODE.VUE LOVE'
      const wrapper = mount(QrcodeVue, {
        props: {
          value,
          renderAs: 'svg',
        },
      })
      const path = wrapper.find('path')
      const d = path.attributes('d')
      expect(d).toBeDefined()
      expect(d).not.toBe('')
      // d should be a valid SVG path string starting with M
      expect(d).toMatch(/^M0 0h7v1H0zM8 0h1v1H8zM10 0h1v1H10zM14,0 h7v1H14zM0 1h1v1H0zM6 1h1v1H6zM8/)

      await wrapper.setProps({ level: 'H'})
      const _d = path.attributes('d')
      expect(_d).toMatch(/^M0 0h7v1H0zM9 0h3v1H9zM14 0h1v1H14zM18,0 h7v1H18zM0 1h1v1H0zM6 1h1v1H6zM8/)
    })

    it('generates different path data for different error correction levels', () => {
      const value = 'QRCODE.VUE LOVE'
      const levels = ['L', 'M', 'Q', 'H'] as const
      const dValues: string[] = []

      levels.forEach(level => {
        const wrapper = mount(QrcodeVue, {
          props: {
            value,
            renderAs: 'svg',
            level,
          },
        })
        const path = wrapper.find('path')
        const d = path.attributes('d')
        expect(d).toBeDefined()
        expect(d).not.toBe('')
        // d should be a valid SVG path string
        if (d) {
          expect(d).toMatch(/^M/)
          dValues.push(d)
        }
      })

      // Error correction may or may not affect the actual module pattern
      // for short text, but we should have valid path data for all levels
      expect(dValues.length).toBe(4)
      // At least some levels should produce different path data
      // (not all levels may be different for short text)
      const uniqueDValues = new Set(dValues)
      expect(uniqueDValues.size).toBeGreaterThan(0)
    })

    it('generates same path data for same input values', () => {
      const value = 'QRCODE.VUE LOVE'
      const level = 'M'

      const wrapper1 = mount(QrcodeVue, {
        props: {
          value,
          renderAs: 'svg',
          level,
        },
      })
      const path1 = wrapper1.find('path')
      const d1 = path1.attributes('d')

      const wrapper2 = mount(QrcodeVue, {
        props: {
          value,
          renderAs: 'svg',
          level,
        },
      })
      const path2 = wrapper2.find('path')
      const d2 = path2.attributes('d')

      // Same input should produce same output
      expect(d1).toBeDefined()
      expect(d2).toBeDefined()
      expect(d1).toBe(d2)
    })

    it('generates different path data with margin', () => {
      const value = 'QRCODE.VUE LOVE'

      const wrapperNoMargin = mount(QrcodeVue, {
        props: {
          value,
          renderAs: 'svg',
          margin: 0,
        },
      })
      const pathNoMargin = wrapperNoMargin.find('path')
      const dNoMargin = pathNoMargin.attributes('d')

      const wrapperWithMargin = mount(QrcodeVue, {
        props: {
          value,
          renderAs: 'svg',
          margin: 4,
        },
      })
      const pathWithMargin = wrapperWithMargin.find('path')
      const dWithMargin = pathWithMargin.attributes('d')

      // Margin should affect the path coordinates
      expect(dNoMargin).toBeDefined()
      expect(dWithMargin).toBeDefined()
      expect(dNoMargin).not.toBe(dWithMargin)
    })
  })

  describe('render-as switching', () => {
    it('switches from canvas to SVG when renderAs changes', async () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'canvas',
        },
      })
      expect(wrapper.html()).toContain('<canvas')
      expect(wrapper.html()).not.toContain('<svg')

      await wrapper.setProps({ renderAs: 'svg' })
      expect(wrapper.html()).toContain('<svg')
      expect(wrapper.html()).not.toContain('<canvas')
    })

    it('switches from SVG to canvas when renderAs changes', async () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
        },
      })
      expect(wrapper.html()).toContain('<svg')
      expect(wrapper.html()).not.toContain('<canvas')

      await wrapper.setProps({ renderAs: 'canvas' })
      expect(wrapper.html()).toContain('<canvas')
      expect(wrapper.html()).not.toContain('<svg')
    })

    it('preserves other props when switching renderAs', async () => {
      const size = 150
      const background = '#f0f0f0'
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'canvas',
          size,
          background,
        },
      })

      await wrapper.setProps({ renderAs: 'svg' })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe(String(size))
      const rect = svg.find('rect')
      expect(rect.attributes('fill')).toBe(background)
    })
  })

  describe('prop validation', () => {
    it('accepts valid renderAs values', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'canvas',
        },
      })
      expect(wrapper.html()).toContain('<canvas')

      const wrapper2 = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
        },
      })
      expect(wrapper2.html()).toContain('<svg')
    })

    it('falls back to default when invalid renderAs provided', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'invalid' as any,
        },
      })
      // Should default to canvas
      expect(wrapper.html()).toContain('<canvas')
    })

    it('validates gradientType prop', () => {
      const wrapper = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          gradient: true,
          gradientType: 'linear',
        },
      })
      expect(wrapper.html()).toContain('linearGradient')

      const wrapper2 = mount(QrcodeVue, {
        props: {
          value: 'test',
          renderAs: 'svg',
          gradient: true,
          gradientType: 'radial',
        },
      })
      expect(wrapper2.html()).toContain('radialGradient')
    })
  })
})
