import type { Meta, StoryObj } from '@storybook/vue3'
import AdminCard from './AdminCard.vue'

const meta = {
  title: 'components/admin/AdminCard',
  component: AdminCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    unit: { control: 'text' },
  },
} satisfies Meta<typeof AdminCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Total Sales',
    value: '1,234,567',
    unit: '円',
  },
}

export const WithSlot: Story = {
    render: (args) => ({
        components: { AdminCard },
        setup() {
            return { args }
        },
        template: `
        <AdminCard v-bind="args">
            <div class="text-2xl font-bold">Custom Content</div>
            <p class="text-xs text-muted-foreground">
                +20.1% from last month
            </p>
        </AdminCard>
        `,
    }),
    args: {
        title: 'Total Revenue',
    },
}
