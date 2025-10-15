import { cpSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '..', 'dist')
const source = resolve(distDir, 'index.html')
const destination = resolve(distDir, '404.html')

cpSync(source, destination)
