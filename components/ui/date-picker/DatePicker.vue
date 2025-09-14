<script setup lang="ts">
import { type Ref, computed } from 'vue'
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  today,
  CalendarDate
} from '@internationalized/date'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

const df = new DateFormatter('ja-JP', {
  dateStyle: 'long',
})

const modelValue = defineModel<Date | null>({ required: true })

const dateValue = computed({
  get: () => {
    if (!modelValue.value) return undefined
    const [year, month, day] = modelValue.value.toISOString().split('T')[0].split('-').map(Number)
    return new CalendarDate(year, month, day)
  },
  set: (val) => {
    if (val) {
      modelValue.value = val.toDate(getLocalTimeZone())
    } else {
      modelValue.value = null
    }
  }
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'w-[240px] justify-start text-left font-normal',
          !modelValue && 'text-muted-foreground',
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ modelValue ? df.format(modelValue) : "日付を選択" }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar
        v-model="dateValue"
        initial-focus
        :first-day-of-week="1"
        :show-outside-days="true"
      />
    </PopoverContent>
  </Popover>
</template>
