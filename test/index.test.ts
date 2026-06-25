import { describe, expect, it } from '@rstest/core'
import { mount, VueWrapper } from '@vue/test-utils'
import QrcodeVue, { QrcodeCanvas, QrcodeSvg } from '../src'

// ─── Shared Test Data ───
const DEFAULT_VALUE = 'test'
const TEST_IMAGE = { src: 'test.png', height: 30, width: 30 }
const TEST_IMAGE_WITH_EXCAVATE = { ...TEST_IMAGE, excavate: true }
const TEST_IMAGE_WITH_BORDER_RADIUS = { ...TEST_IMAGE, excavate: true, borderRadius: 5 }

// ─── Helper Functions ───
function mountQR(props: Record<string, unknown> = {}): VueWrapper {
  return mount(QrcodeVue, {
    props: {
      value: DEFAULT_VALUE,
      ...props,
    },
  })
}

function mountCanvas(props: Record<string, unknown> = {}): VueWrapper {
  return mount(QrcodeCanvas, {
    props: {
      value: DEFAULT_VALUE,
      ...props,
    },
  })
}

function mountSvg(props: Record<string, unknown> = {}): VueWrapper {
  return mount(QrcodeSvg, {
    props: {
      value: DEFAULT_VALUE,
      ...props,
    },
  })
}

function getSvgRectWithFill(wrapper: VueWrapper, fill: string) {
  const svg = wrapper.find('svg')
  const rects = svg.findAll('rect')
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    if (rect.attributes('fill') === fill && rect.attributes('x') !== undefined) {
      return rect
    }
  }
  return undefined
}

function getSvgPathData(wrapper: VueWrapper): string | undefined {
  return wrapper.find('path').attributes('d')
}

describe('QrcodeVue', () => {
  describe('default rendering (canvas)', () => {
    it('renders canvas with default props', () => {
      const wrapper = mountQR()
      const html = wrapper.html()
      expect(html).toContain('<canvas')
      expect(html).not.toContain('<svg')
    })

    it('applies correct size to canvas', () => {
      const size = 200
      const wrapper = mountQR({ size })
      const canvas = wrapper.find('canvas')
      const style = canvas.attributes('style')
      expect(style).toContain(`width: ${size}px`)
      expect(style).toContain(`height: ${size}px`)
    })

    it('renders canvas with margin', () => {
      const wrapper = mountQR({ margin: 4 })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('renders canvas with different error correction levels', () => {
      const levels = ['L', 'M', 'Q', 'H'] as const
      levels.forEach(level => {
        const wrapper = mountQR({ level })
        expect(wrapper.html()).toContain('<canvas')
      })
    })

    it('renders canvas with custom background and foreground colors', () => {
      const wrapper = mountQR({
        background: '#f0f0f0',
        foreground: '#333333',
      })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('renders canvas with gradient', () => {
      const wrapper = mountQR({
        gradient: true,
        gradientType: 'linear',
        gradientStartColor: '#000',
        gradientEndColor: '#fff',
      })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('renders canvas with image settings', () => {
      const wrapper = mountQR({ imageSettings: TEST_IMAGE })
      const html = wrapper.html()
      expect(html).toContain('<canvas')
      expect(html).toContain('<img')
    })

    it('renders canvas with image borderRadius', () => {
      const wrapper = mountQR({ imageSettings: TEST_IMAGE_WITH_BORDER_RADIUS })
      const html = wrapper.html()
      expect(html).toContain('<canvas')
      expect(html).toContain('<img')
    })

    it('renders canvas without borderRadius when borderRadius is 0', () => {
      const wrapper = mountQR({
        imageSettings: { ...TEST_IMAGE, excavate: true, borderRadius: 0 },
      })
      const html = wrapper.html()
      expect(html).toContain('<canvas')
      expect(html).toContain('<img')
    })

    it('handles invalid error correction level gracefully in canvas mode', () => {
      // @ts-expect-error testing invalid prop value
      const wrapper = mountQR({ level: 'INVALID' })
      expect(wrapper.html()).toContain('<canvas')
    })
  })

  describe('SVG rendering', () => {
    it('renders SVG when renderAs is svg', () => {
      const wrapper = mountQR({ renderAs: 'svg' })
      const html = wrapper.html()
      expect(html).toContain('<svg')
      expect(html).not.toContain('<canvas')
    })

    it('applies correct size to SVG', () => {
      const size = 200
      const wrapper = mountQR({ renderAs: 'svg', size })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe(String(size))
      expect(svg.attributes('height')).toBe(String(size))
    })

    it('sets SVG xmlns and viewBox', () => {
      const wrapper = mountQR({ renderAs: 'svg', size: 100, margin: 2 })
      const svg = wrapper.find('svg')
      expect(svg.attributes('xmlns')).toBe('http://www.w3.org/2000/svg')
      expect(svg.attributes('viewBox')).toMatch(/^0 0 \d+ \d+$/)
    })

    it('renders SVG with margin', () => {
      const wrapper = mountQR({ renderAs: 'svg', margin: 4 })
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBeDefined()
    })

    it('renders SVG with different error correction levels', () => {
      const levels = ['L', 'M', 'Q', 'H'] as const
      levels.forEach(level => {
        const wrapper = mountQR({ renderAs: 'svg', level })
        expect(wrapper.html()).toContain('<svg')
      })
    })

    it('renders SVG with custom background and foreground colors', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        background: '#f0f0f0',
        foreground: '#333333',
      })
      const rect = wrapper.find('rect')
      const path = wrapper.find('path')
      expect(rect.attributes('fill')).toBe('#f0f0f0')
      expect(path.attributes('fill')).toBe('#333333')
    })

    it('renders SVG with linear gradient', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        gradient: true,
        gradientType: 'linear',
        gradientStartColor: '#000',
        gradientEndColor: '#fff',
      })
      expect(wrapper.html()).toContain('linearGradient')
      const path = wrapper.find('path')
      expect(path.attributes('fill')).toMatch(/^url\(#qrcode\.vue-gradient-[^"]+\)$/)
    })

    it('renders SVG with radial gradient', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        gradient: true,
        gradientType: 'radial',
        gradientStartColor: '#000',
        gradientEndColor: '#fff',
      })
      expect(wrapper.html()).toContain('radialGradient')
    })

    it('renders SVG with image settings', () => {
      const wrapper = mountQR({ renderAs: 'svg', imageSettings: TEST_IMAGE })
      expect(wrapper.html()).toContain('<image')
      const image = wrapper.find('image')
      expect(image.attributes('href')).toBe(TEST_IMAGE.src)
    })

    it('does not render image when src is empty', () => {
      const wrapper = mountQR({ renderAs: 'svg', imageSettings: {} })
      expect(wrapper.html()).not.toContain('<image')
      expect(wrapper.find('image').exists()).toBe(false)
    })

    describe('SVG image excavation', () => {
      it('renders excavation border for image with excavate enabled', () => {
        const wrapper = mountQR({
          renderAs: 'svg',
          imageSettings: TEST_IMAGE_WITH_EXCAVATE,
        })
        const html = wrapper.html()
        expect(html).toContain('<image')
        expect(html).toContain('<rect')

        const borderRect = getSvgRectWithFill(wrapper, '#fff')
        expect(borderRect).toBeDefined()
        expect(borderRect?.attributes('x')).toBeDefined()
        expect(borderRect?.attributes('y')).toBeDefined()
        expect(borderRect?.attributes('width')).toBeDefined()
        expect(borderRect?.attributes('height')).toBeDefined()
      })

      it('renders excavation border without clip-path when borderRadius is 0', () => {
        const wrapper = mountQR({
          renderAs: 'svg',
          imageSettings: { ...TEST_IMAGE, excavate: true, borderRadius: 0 },
        })
        const html = wrapper.html()
        expect(html).toContain('<image')
        expect(html).toContain('<rect')
        expect(html).not.toContain('clipPath')

        const borderRect = getSvgRectWithFill(wrapper, '#fff')
        expect(borderRect).toBeDefined()
        expect(borderRect?.attributes('rx')).toBe('0')
        expect(borderRect?.attributes('ry')).toBe('0')
      })

      it('renders excavation border with rounded corners when borderRadius is set', () => {
        const wrapper = mountQR({
          renderAs: 'svg',
          imageSettings: TEST_IMAGE_WITH_BORDER_RADIUS,
        })
        expect(wrapper.html()).toContain('<image')
        expect(wrapper.html()).toContain('clip-path')

        const svg = wrapper.find('svg')
        expect(svg.find('defs').exists()).toBe(true)
        expect(wrapper.html()).toContain('clipPath')

        const image = wrapper.find('image')
        expect(image.attributes('clip-path')).toMatch(/^url\(#qrcode\.vue-logo-clip-path-[^"]+\)$/)

        const borderRect = getSvgRectWithFill(wrapper, '#fff')
        expect(borderRect).toBeDefined()
        expect(borderRect?.attributes('rx')).toBeDefined()
        expect(borderRect?.attributes('ry')).toBeDefined()
        expect(borderRect?.attributes('rx')).not.toBe('0')
        expect(borderRect?.attributes('ry')).not.toBe('0')
      })

      it('does not render clip-path when borderRadius is 0, undefined, or negative', async () => {
        const imageSettings = { ...TEST_IMAGE, excavate: true }
        const wrapper = mountQR({
          renderAs: 'svg',
          imageSettings,
        })

        expect(wrapper.html()).toContain('<image')
        expect(wrapper.html()).not.toContain('clipPath')
        let image = wrapper.find('image')
        expect(image.attributes('clip-path')).toBeUndefined()

        await wrapper.setProps({
          imageSettings: { ...imageSettings, borderRadius: 0 },
        })

        expect(wrapper.html()).toContain('<image')
        expect(wrapper.html()).not.toContain('clipPath')
        image = wrapper.find('image')
        expect(image.attributes('clip-path')).toBeUndefined()

        await wrapper.setProps({
          imageSettings: { ...imageSettings, borderRadius: -5 },
        })

        expect(wrapper.html()).toContain('<image')
        expect(wrapper.html()).not.toContain('clipPath')
      })

      it('handles fractional and very large borderRadius values', async () => {
        const imageSettings = { ...TEST_IMAGE, excavate: true }

        const wrapper = mountQR({
          renderAs: 'svg',
          imageSettings: { ...imageSettings, borderRadius: 2.5 },
        })

        expect(wrapper.html()).toContain('<image')
        expect(wrapper.html()).toContain('clip-path')
        let image = wrapper.find('image')
        expect(image.attributes('clip-path')).toMatch(/^url\(#qrcode\.vue-logo-clip-path-[^"]+\)$/)

        await wrapper.setProps({
          imageSettings: { ...imageSettings, borderRadius: 100 },
        })

        expect(wrapper.html()).toContain('<image')
        expect(wrapper.html()).toContain('clip-path')
        image = wrapper.find('image')
        expect(image.attributes('clip-path')).toMatch(/^url\(#qrcode\.vue-logo-clip-path-[^"]+\)$/)
      })
    })

    it('handles invalid error correction level gracefully in SVG mode', () => {
      // @ts-expect-error testing invalid prop value
      const wrapper = mountQR({ renderAs: 'svg', level: 'INVALID' })
      expect(wrapper.html()).toContain('<svg')
    })

    describe('path data generation', () => {
      it('generates deterministic path data for consistent inputs', () => {
        const value = 'QRCODE.VUE LOVE'
        const level = 'M'

        const wrapper1 = mountQR({ value, renderAs: 'svg', level })
        const d1 = getSvgPathData(wrapper1)

        const wrapper2 = mountQR({ value, renderAs: 'svg', level })
        const d2 = getSvgPathData(wrapper2)

        expect(d1).toBeDefined()
        expect(d2).toBeDefined()
        expect(d1).toBe(d2)
      })

      it('generates different path data for different error correction levels', () => {
        const value = 'QRCODE.VUE LOVE DIFFERENT LEVELS'
        const levels = ['L', 'M', 'Q', 'H'] as const
        const dValues: string[] = []

        levels.forEach(level => {
          const wrapper = mountQR({ value, renderAs: 'svg', level })
          const d = getSvgPathData(wrapper)
          expect(d).toBeDefined()
          expect(d).not.toBe('')
          if (d) {
            expect(d).toMatch(/^M/)
            dValues.push(d)
          }
        })

        expect(dValues.length).toBe(4)
        const uniqueDValues = new Set(dValues)
        expect(uniqueDValues.size).toBeGreaterThanOrEqual(2)
      })

      it('generates different path data with margin', () => {
        const value = 'QRCODE.VUE LOVE'

        const wrapperNoMargin = mountQR({ value, renderAs: 'svg', margin: 0 })
        const dNoMargin = getSvgPathData(wrapperNoMargin)

        const wrapperWithMargin = mountQR({ value, renderAs: 'svg', margin: 4 })
        const dWithMargin = getSvgPathData(wrapperWithMargin)

        expect(dNoMargin).toBeDefined()
        expect(dWithMargin).toBeDefined()
        expect(dNoMargin).not.toBe(dWithMargin)
      })

      it('generates correct path data for value "QRCODE.VUE LOVE"', async () => {
        const value = 'QRCODE.VUE LOVE'
        const wrapper = mountQR({ value, renderAs: 'svg' })
        const d = getSvgPathData(wrapper)
        expect(d).toBeDefined()
        expect(d).not.toBe('')
        expect(d).toMatch(/^M0 0h7v1H0zM8 0h1v1H8zM10 0h1v1H10zM14,0 h7v1H14zM0 1h1v1H0zM6 1h1v1H6zM8/)

        await wrapper.setProps({ level: 'H' })
        const _d = getSvgPathData(wrapper)
        expect(_d).toMatch(/^M0 0h7v1H0zM9 0h3v1H9zM14 0h1v1H14zM18,0 h7v1H18zM0 1h1v1H0zM6 1h1v1H6zM8/)
      })
    })
  })

  describe('render-as switching', () => {
    it('switches from canvas to SVG when renderAs changes', async () => {
      const wrapper = mountQR({ renderAs: 'canvas' })
      expect(wrapper.html()).toContain('<canvas')
      expect(wrapper.html()).not.toContain('<svg')

      await wrapper.setProps({ renderAs: 'svg' })
      expect(wrapper.html()).toContain('<svg')
      expect(wrapper.html()).not.toContain('<canvas')
    })

    it('switches from SVG to canvas when renderAs changes', async () => {
      const wrapper = mountQR({ renderAs: 'svg' })
      expect(wrapper.html()).toContain('<svg')
      expect(wrapper.html()).not.toContain('<canvas')

      await wrapper.setProps({ renderAs: 'canvas' })
      expect(wrapper.html()).toContain('<canvas')
      expect(wrapper.html()).not.toContain('<svg')
    })

    it('preserves other props when switching renderAs', async () => {
      const size = 150
      const background = '#f0f0f0'
      const wrapper = mountQR({ renderAs: 'canvas', size, background })

      await wrapper.setProps({ renderAs: 'svg' })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe(String(size))
      const rect = svg.find('rect')
      expect(rect.attributes('fill')).toBe(background)
    })
  })

  describe('reactive updates', () => {
    it('updates QR code when value changes', async () => {
      const wrapper = mountQR({ renderAs: 'svg' })
      const d1 = getSvgPathData(wrapper)

      await wrapper.setProps({ value: 'updated-value' })
      const d2 = getSvgPathData(wrapper)

      expect(d1).toBeDefined()
      expect(d2).toBeDefined()
      expect(d1).not.toBe(d2)
    })

    it('updates QR code when size changes', async () => {
      const wrapper = mountQR({ renderAs: 'svg', size: 100 })
      const svg1 = wrapper.find('svg')
      expect(svg1.attributes('width')).toBe('100')

      await wrapper.setProps({ size: 200 })
      const svg2 = wrapper.find('svg')
      expect(svg2.attributes('width')).toBe('200')
    })

    it('updates QR code when level changes', async () => {
      const wrapper = mountQR({ renderAs: 'svg', level: 'L', value: 'QRCODE.VUE LOVE' })
      const d1 = getSvgPathData(wrapper)

      await wrapper.setProps({ level: 'H' })
      const d2 = getSvgPathData(wrapper)

      expect(d1).toBeDefined()
      expect(d2).toBeDefined()
      expect(d1).not.toBe(d2)
    })

    it('updates image settings reactively', async () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        size: 21,
        imageSettings: TEST_IMAGE,
      })
      expect(wrapper.html()).toContain('<image')

      await wrapper.setProps({ imageSettings: { ...TEST_IMAGE, x: 10, y: 20 } })
      const image = wrapper.find('image')
      expect(image.attributes('x')).toBe('10')
      expect(image.attributes('y')).toBe('20')

      await wrapper.setProps({ imageSettings: { ...TEST_IMAGE, excavate: true } })
      expect(getSvgRectWithFill(wrapper, '#fff')).toBeDefined()

      await wrapper.setProps({ imageSettings: {} })
      expect(wrapper.find('image').exists()).toBe(false)
    })
  })

  describe('prop validation', () => {
    it('accepts valid renderAs values', () => {
      const wrapper1 = mountQR({ renderAs: 'canvas' })
      expect(wrapper1.html()).toContain('<canvas')

      const wrapper2 = mountQR({ renderAs: 'svg' })
      expect(wrapper2.html()).toContain('<svg')
    })

    it('falls back to default when invalid renderAs provided', () => {
      // @ts-expect-error testing invalid prop value
      const wrapper = mountQR({ renderAs: 'invalid' })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('validates gradientType prop', () => {
      const wrapper1 = mountQR({
        renderAs: 'svg',
        gradient: true,
        gradientType: 'linear',
      })
      expect(wrapper1.html()).toContain('linearGradient')

      const wrapper2 = mountQR({
        renderAs: 'svg',
        gradient: true,
        gradientType: 'radial',
      })
      expect(wrapper2.html()).toContain('radialGradient')
    })

    it('falls back to default for invalid gradientType', () => {
      // @ts-expect-error testing invalid prop value
      const wrapper = mountQR({
        renderAs: 'svg',
        gradient: true,
        gradientType: 'diagonal',
      })
      expect(wrapper.html()).toContain('radialGradient')
    })

    it('rejects negative margin values', () => {
      // @ts-expect-error testing invalid prop value
      const wrapper = mountQR({ margin: -4 })
      expect(wrapper.html()).toContain('<canvas')
    })
  })

  describe('multi-instance SVG ID uniqueness', () => {
    it('generates unique gradient IDs for multiple SVG instances', () => {
      const wrapper1 = mountQR({
        renderAs: 'svg',
        gradient: true,
        gradientType: 'linear',
      })
      const wrapper2 = mountQR({
        renderAs: 'svg',
        gradient: true,
        gradientType: 'linear',
      })

      const html1 = wrapper1.html()
      const html2 = wrapper2.html()

      const id1 = html1.match(/id="(qrcode\.vue-gradient-[^"]+)"/)?.[1]
      const id2 = html2.match(/id="(qrcode\.vue-gradient-[^"]+)"/)?.[1]

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
    })

    it('generates unique clipPath IDs for multiple SVG instances', () => {
      const imageSettings = { ...TEST_IMAGE, excavate: true, borderRadius: 5 }
      const wrapper1 = mountQR({ renderAs: 'svg', imageSettings })
      const wrapper2 = mountQR({ renderAs: 'svg', imageSettings })

      const html1 = wrapper1.html()
      const html2 = wrapper2.html()

      const clipId1 = html1.match(/id="(qrcode\.vue-logo-clip-path-[^"]+)"/)?.[1]
      const clipId2 = html2.match(/id="(qrcode\.vue-logo-clip-path-[^"]+)"/)?.[1]

      expect(clipId1).toBeDefined()
      expect(clipId2).toBeDefined()
      expect(clipId1).not.toBe(clipId2)
    })

    it('uses custom id prop for gradient and clip-path IDs', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        id: 'my-qr-id',
        gradient: true,
        gradientType: 'linear',
        imageSettings: TEST_IMAGE_WITH_BORDER_RADIUS,
      })
      const html = wrapper.html()
      expect(html).toContain('id="qrcode.vue-gradient-my-qr-id"')
      expect(html).toContain('id="qrcode.vue-logo-clip-path-my-qr-id"')
      expect(html).toContain('url(#qrcode.vue-gradient-my-qr-id)')
      expect(html).toContain('url(#qrcode.vue-logo-clip-path-my-qr-id)')
    })

    it('gradient fill references match their own gradient ID', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        gradient: true,
        gradientType: 'linear',
      })

      const html = wrapper.html()
      const gradientId = html.match(/id="(qrcode\.vue-gradient-[^"]+)"/)?.[1]
      expect(gradientId).toBeDefined()

      const path = wrapper.find('path')
      expect(path.attributes('fill')).toBe(`url(#${gradientId})`)
    })

    it('clip-path references match their own clipPath ID', () => {
      const imageSettings = { ...TEST_IMAGE, excavate: true, borderRadius: 5 }
      const wrapper = mountQR({ renderAs: 'svg', imageSettings })

      const html = wrapper.html()
      const clipId = html.match(/id="(qrcode\.vue-logo-clip-path-[^"]+)"/)?.[1]
      expect(clipId).toBeDefined()

      const image = wrapper.find('image')
      expect(image.attributes('clip-path')).toBe(`url(#${clipId})`)
    })
  })

  describe('radius prop', () => {
    describe('prop validation', () => {
      it('accepts valid radius values within range [0, 0.5]', () => {
        const validValues = [0, 0.1, 0.25, 0.3, 0.5]

        validValues.forEach(radius => {
          const wrapper = mountQR({ renderAs: 'svg', radius })
          expect(wrapper.html()).toContain('<svg')
          const path = wrapper.find('path')
          expect(path.exists()).toBe(true)
        })
      })

      it('rejects invalid radius values outside range [0, 0.5]', () => {
        const invalidValues = [-0.1, -1, 0.6, 1, 100]

        invalidValues.forEach(radius => {
          const wrapper = mountQR({ renderAs: 'svg', radius })
          expect(wrapper.html()).toContain('<svg')
        })
      })

      it('handles NaN and special number values', () => {
        const wrapper = mountQR({ renderAs: 'svg', radius: NaN })
        expect(wrapper.html()).toContain('<svg')
      })
    })

    describe('default value', () => {
      it('uses radius 0 by default', () => {
        const wrapper = mountQR({ renderAs: 'svg' })
        const d = getSvgPathData(wrapper)

        expect(d).toBeDefined()
        expect(d).toMatch(/^[MhVHz]/)
        expect(d).not.toMatch(/[aA]/)
      })

      it('renders rect-style path commands when radius is 0', () => {
        const wrapper = mountQR({ renderAs: 'svg', radius: 0 })
        const d = getSvgPathData(wrapper)

        expect(d).toMatch(/[hvHVz]/)
        expect(d).not.toMatch(/[aA]/)
      })
    })

    describe('reactive switching', () => {
      it('updates rendering when radius changes from 0 to positive value', async () => {
        const wrapper = mountQR({ renderAs: 'svg', radius: 0 })

        let d = getSvgPathData(wrapper)
        expect(d).toBeDefined()
        expect(d).not.toMatch(/[aA]/)

        await wrapper.setProps({ radius: 0.3 })

        d = getSvgPathData(wrapper)
        expect(d).toBeDefined()
      })

      it('updates rendering when radius changes from positive to 0', async () => {
        const wrapper = mountQR({ renderAs: 'svg', radius: 0.4 })

        let d = getSvgPathData(wrapper)
        expect(d).toBeDefined()

        await wrapper.setProps({ radius: 0 })

        d = getSvgPathData(wrapper)
        expect(d).toBeDefined()
        expect(d).not.toMatch(/[aA]/)
      })

      it('handles multiple radius changes', async () => {
        const wrapper = mountQR({ renderAs: 'svg', radius: 0 })

        const d0 = getSvgPathData(wrapper)
        expect(d0).toBeDefined()

        await wrapper.setProps({ radius: 0.25 })
        const d1 = getSvgPathData(wrapper)
        expect(d1).toBeDefined()

        await wrapper.setProps({ radius: 0.5 })
        const d2 = getSvgPathData(wrapper)
        expect(d2).toBeDefined()

        await wrapper.setProps({ radius: 0 })
        const d3 = getSvgPathData(wrapper)
        expect(d3).toBeDefined()
        expect(d3).toBe(d0)
      })

      it('reacts to radius changes in canvas mode', async () => {
        const wrapper = mountQR({ renderAs: 'canvas', radius: 0 })

        expect(wrapper.html()).toContain('<canvas')
        expect(wrapper.html()).not.toContain('<svg')

        await wrapper.setProps({ radius: 0.3 })

        expect(wrapper.html()).toContain('<canvas')
        expect(wrapper.html()).not.toContain('<svg')
      })
    })

    describe('radius rendering', () => {
      describe('SVG path rendering', () => {
        it('produces rect-style path commands when radius is 0', () => {
          const wrapper = mountQR({ renderAs: 'svg', radius: 0 })
          const d = getSvgPathData(wrapper)

          expect(d).toBeDefined()
          expect(d).toMatch(/^[MmHhVvLlZz0-9,.\s-]+$/)
          expect(d).not.toMatch(/[aA]/)
        })

        it('produces path with arc commands when radius > 0', () => {
          const wrapper = mountQR({ renderAs: 'svg', radius: 0.3 })
          const d = getSvgPathData(wrapper)

          expect(d).toBeDefined()
          expect(d).toMatch(/[aA]/)
        })

        it('isolated dark module produces 4 arcs when radius > 0', () => {
          const wrapper = mountQR({
            value: 'A',
            renderAs: 'svg',
            radius: 0.4,
            level: 'L',
            margin: 0,
          })
          const d = getSvgPathData(wrapper)

          expect(d).toBeDefined()
          const arcMatches = d?.match(/[aA]/g)
          expect(arcMatches).toBeDefined()
          expect(arcMatches?.length).toBeGreaterThan(0)
        })

        it('does not render inner corner arcs for adjacent dark modules', () => {
          const wrapper = mountQR({ renderAs: 'svg', radius: 0.3 })
          const d = getSvgPathData(wrapper)

          expect(d).toBeDefined()
          expect(d).toMatch(/[aA]/)
        })

        it('handles both radius 0 and radius > 0 in same SVG session', async () => {
          const wrapper = mountQR({ renderAs: 'svg', radius: 0 })

          let d = getSvgPathData(wrapper)
          expect(d).toBeDefined()
          expect(d).not.toMatch(/[aA]/)

          await wrapper.setProps({ radius: 0.25 })

          d = getSvgPathData(wrapper)
          expect(d).toBeDefined()

          await wrapper.setProps({ radius: 0 })

          d = getSvgPathData(wrapper)
          expect(d).toBeDefined()
          expect(d).not.toMatch(/[aA]/)
        })
      })

      describe('Canvas rendering', () => {
        it('accepts radius prop in canvas mode', () => {
          const wrapper = mountQR({ renderAs: 'canvas', radius: 0.3 })
          expect(wrapper.html()).toContain('<canvas')
        })

        it('renders rounded corners in canvas when radius > 0', () => {
          const wrapper = mountQR({ renderAs: 'canvas', radius: 0.4 })
          expect(wrapper.html()).toContain('<canvas')
        })

        it('handles radius switching in canvas mode', async () => {
          const wrapper = mountQR({ renderAs: 'canvas', radius: 0 })

          expect(wrapper.html()).toContain('<canvas')

          await wrapper.setProps({ radius: 0.3 })
          expect(wrapper.html()).toContain('<canvas')

          await wrapper.setProps({ radius: 0 })
          expect(wrapper.html()).toContain('<canvas')
        })
      })

      describe('neighbor logic verification', () => {
        it('rounds corners when both adjacent neighbors are light', () => {
          const wrapper = mountQR({ renderAs: 'svg', radius: 0.3 })
          const d = getSvgPathData(wrapper)

          expect(d).toBeDefined()
          expect(d).toMatch(/[aA]/)
        })

        it('does not round corners when adjacent neighbor is dark', () => {
          const wrapper = mountQR({ renderAs: 'svg', radius: 0.5 })
          const d = getSvgPathData(wrapper)

          expect(d).toBeDefined()
        })
      })
    })
  })

  describe('accessibility', () => {
    it('sets role="img" on SVG element', () => {
      const wrapper = mountQR({ renderAs: 'svg' })
      const svg = wrapper.find('svg')
      expect(svg.attributes('role')).toBe('img')
      expect(svg.attributes('aria-label')).toBeUndefined()
    })

    it('sets role="img" on canvas element', () => {
      const wrapper = mountQR({ renderAs: 'canvas' })
      const canvas = wrapper.find('canvas')
      expect(canvas.attributes('role')).toBe('img')
      expect(canvas.attributes('aria-label')).toBeUndefined()
    })
  })

  describe('image positioning', () => {
    it('centers image by default when x and y are not provided', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        imageSettings: TEST_IMAGE,
      })
      const image = wrapper.find('image')
      const x = image.attributes('x')
      const y = image.attributes('y')
      expect(x).toBeDefined()
      expect(y).toBeDefined()
      expect(Number(x)).toBeGreaterThan(0)
      expect(Number(y)).toBeGreaterThan(0)
    })

    it('positions image at custom x and y coordinates', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        size: 21,
        imageSettings: { ...TEST_IMAGE, x: 10, y: 20 },
      })
      const image = wrapper.find('image')
      expect(image.attributes('x')).toBe('10')
      expect(image.attributes('y')).toBe('20')
    })

    it('uses default image size when width and height are omitted', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        imageSettings: { src: 'test.png' },
      })
      const image = wrapper.find('image')
      expect(image.attributes('width')).toBeDefined()
      expect(image.attributes('height')).toBeDefined()
      expect(Number(image.attributes('width'))).toBeGreaterThan(0)
      expect(Number(image.attributes('height'))).toBeGreaterThan(0)
    })
  })

  describe('image crossOrigin', () => {
    it('renders canvas img with crossorigin attribute', () => {
      const wrapper = mountQR({
        renderAs: 'canvas',
        imageSettings: { ...TEST_IMAGE, crossOrigin: 'anonymous' },
      })
      const img = wrapper.find('img')
      expect(img.attributes('crossorigin')).toBe('anonymous')
    })

    it('does not render canvas img crossorigin attribute when not provided', () => {
      const wrapper = mountQR({
        renderAs: 'canvas',
        imageSettings: TEST_IMAGE,
      })
      const img = wrapper.find('img')
      expect(img.attributes('crossorigin')).toBeUndefined()
    })

    it('renders svg image with crossorigin attribute', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        imageSettings: { ...TEST_IMAGE, crossOrigin: 'use-credentials' },
      })
      const image = wrapper.find('image')
      expect(image.attributes('crossorigin')).toBe('use-credentials')
    })

    it('does not render svg image crossorigin attribute when not provided', () => {
      const wrapper = mountQR({
        renderAs: 'svg',
        imageSettings: TEST_IMAGE,
      })
      const image = wrapper.find('image')
      expect(image.attributes('crossorigin')).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles empty string value', () => {
      const wrapper = mountQR({ value: '' })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('handles long string value', () => {
      const value = 'a'.repeat(500)
      const wrapper = mountQR({ value })
      expect(wrapper.html()).toContain('<canvas')
    })

    it('handles value with special characters', () => {
      const value = 'https://example.com?foo=bar&baz=qux'
      const wrapper = mountQR({ value, renderAs: 'svg' })
      expect(wrapper.html()).toContain('<svg')
      expect(wrapper.find('svg').attributes('role')).toBe('img')
    })
  })

  describe('canvas expose', () => {
    it('exposes toDataURL and download methods on QrcodeCanvas', () => {
      const wrapper = mountCanvas()
      const vm = wrapper.vm as unknown as {
        toDataURL: () => string | undefined
        download: () => void
      }
      expect(typeof vm.toDataURL).toBe('function')
      expect(typeof vm.download).toBe('function')
    })

    it('forwards toDataURL and download methods through QrcodeVue when renderAs is canvas', () => {
      const wrapper = mountQR({ renderAs: 'canvas' })
      const vm = wrapper.vm as unknown as {
        toDataURL: () => string | undefined
        download: () => void
      }
      expect(typeof vm.toDataURL).toBe('function')
      expect(typeof vm.download).toBe('function')
    })

    it('toDataURL returns a string without throwing', () => {
      const wrapper = mountCanvas()
      const vm = wrapper.vm as unknown as {
        toDataURL: () => string | undefined
      }
      const dataURL = vm.toDataURL()
      expect(typeof dataURL).toBe('string')
    })

    it('toDataURL accepts type and quality arguments', () => {
      const wrapper = mountCanvas({ value: DEFAULT_VALUE })
      const vm = wrapper.vm as unknown as {
        toDataURL: (type?: string, quality?: number) => string | undefined
      }
      const dataURL = vm.toDataURL('image/png', 0.8)
      expect(typeof dataURL).toBe('string')
      expect(dataURL).toMatch(/^data:image\/png/)
    })

    it('draws gradient onto the canvas', () => {
      const wrapper = mountCanvas({
        value: DEFAULT_VALUE,
        gradient: true,
        gradientType: 'linear',
        gradientStartColor: '#000000',
        gradientEndColor: '#ffffff',
      })
      const canvas = wrapper.find('canvas')
      const style = canvas.attributes('style')
      expect(style).toContain('width: 100px')
      expect(style).toContain('height: 100px')
    })
  })

  describe('svg expose', () => {
    it('exposes toDataURL and download methods on QrcodeSvg', () => {
      const wrapper = mountSvg({ value: DEFAULT_VALUE })
      const vm = wrapper.vm as unknown as {
        toDataURL: () => string | undefined
        download: () => void
      }
      expect(typeof vm.toDataURL).toBe('function')
      expect(typeof vm.download).toBe('function')
    })

    it('toDataURL returns a data URL containing the SVG', () => {
      const wrapper = mountSvg({ value: DEFAULT_VALUE })
      const vm = wrapper.vm as unknown as {
        toDataURL: () => string | undefined
      }
      const dataURL = vm.toDataURL()
      expect(typeof dataURL).toBe('string')
      expect(dataURL).toMatch(/^data:image\/svg\+xml/)
      expect(dataURL).toContain('svg')
    })

    it('forwards toDataURL and download methods through QrcodeVue when renderAs is svg', () => {
      const wrapper = mountQR({ renderAs: 'svg' })
      const vm = wrapper.vm as unknown as {
        toDataURL: () => string | undefined
        download: () => void
      }
      expect(typeof vm.toDataURL).toBe('function')
      expect(typeof vm.download).toBe('function')
    })
  })
})
