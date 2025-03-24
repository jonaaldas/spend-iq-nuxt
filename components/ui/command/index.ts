import { type VariantProps, cva } from 'class-variance-authority'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { defineComponent, h, ref, toRefs, computed } from 'vue'

const commandDialogContentClass = cva(
  'overflow-hidden p-0 max-w-[750px] w-full gap-4 bg-background/95 shadow-lg rounded-xl border backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/80 border-border/50',
  {
    variants: {},
  }
)

export const CommandDialog = defineComponent({
  name: 'CommandDialog',
  inheritAttrs: false,
  props: {
    open: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:open'],
  setup(props, { slots, emit, attrs }) {
    const { open } = toRefs(props)

    return () =>
      h(
        Dialog,
        {
          open: open.value,
          'onUpdate:open': (value: boolean) => emit('update:open', value),
        },
        () =>
          h(
            DialogContent,
            {
              class: cn(commandDialogContentClass(), attrs.class),
            },
            slots
          )
      )
  },
})

export const CommandInput = defineComponent({
  name: 'CommandInput',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'Type a command or search...',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    const { modelValue, placeholder } = toRefs(props)

    return () =>
      h('input', {
        ...attrs,
        class: cn(
          'flex h-11 w-full rounded-md bg-transparent px-3 py-3 text-sm outline-none border-none ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          attrs.class
        ),
        value: modelValue.value,
        placeholder: placeholder.value,
        onInput: (e: Event) => {
          const target = e.target as HTMLInputElement
          emit('update:modelValue', target.value)
        },
      })
  },
})
