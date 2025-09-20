import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminCard from '~/components/admin/AdminCard/AdminCard.vue'

describe('AdminCard', () => {
  it('renders props correctly', () => {
    const title = '総売上'
    const value = 15000

    const wrapper = mount(AdminCard, {
      props: {
        title,
        value,
      },
    })

    // Propsとして渡したタイトルが表示されていることを確認
    expect(wrapper.text()).toContain(title)

    // Propsとして渡したvalue（数値）が文字列として表示されていることを確認
    // toContainは部分一致なので、15000が含まれていればOK
    expect(wrapper.text()).toContain(value.toString())
  })

  it('renders slot content when passed', () => {
    const slotContent = 'This is slot content'
    const wrapper = mount(AdminCard, {
      props: {
        title: 'Card with Slot',
      },
      slots: {
        default: slotContent,
      },
    })

    expect(wrapper.text()).toContain(slotContent)
  })
})
