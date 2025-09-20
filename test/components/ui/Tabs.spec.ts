import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

describe('Tabs.vue', () => {
  it('switches tabs correctly on trigger click', async () => {
    const activeTab = ref('account')
    const wrapper = mount({
      template: `
        <Tabs v-model="activeTab">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <p>Account content</p>
          </TabsContent>
          <TabsContent value="password">
            <p>Password content</p>
          </TabsContent>
        </Tabs>
      `,
      components: { Tabs, TabsContent, TabsList, TabsTrigger },
      setup() {
        return { activeTab }
      },
    })

    // 1. Initial state
    expect(wrapper.text()).toContain('Account content')
    expect(wrapper.text()).not.toContain('Password content')

    // 2. Find and click the 'Password' trigger
    const passwordTrigger = wrapper.findAll('button').find(b => b.text() === 'Password')
    await passwordTrigger!.trigger('click')
    await nextTick()

    // 3. Assert v-model updated
    expect(activeTab.value).toBe('password')

    // 4. Assert content switched
    expect(wrapper.text()).not.toContain('Account content')
    expect(wrapper.text()).toContain('Password content')
  })
})
