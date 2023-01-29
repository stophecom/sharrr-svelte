import { writable } from 'svelte/store'

export type Status = 'initial' | 'uploading' | 'done'

export const status = writable<Status>('initial')
