import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(process.cwd())

const targets = [
  {label: 'HU01 frontend', file: 'webapp/src/mutator.ts', min: 80},
  {label: 'HU01 backend', file: 'server/services/store/sqlstore/boards_and_blocks.go', min: 80},
  {label: 'HU02 frontend', file: 'webapp/src/components/centerPanel.tsx', min: 80},
  {label: 'HU02 frontend person', file: 'webapp/src/properties/person/confirmPerson.tsx', min: 80},
  {label: 'HU02 frontend date', file: 'webapp/src/properties/date/date.tsx', min: 80},
  {label: 'HU02 backend', file: 'server/app/blocks.go', min: 80},
  {label: 'HU03 frontend', file: 'webapp/src/components/kanban/kanban.tsx', min: 80},
  {label: 'HU03 backend store', file: 'server/services/store/sqlstore/blocks.go', min: 80},
  {label: 'HU03 backend public', file: 'server/services/store/sqlstore/public_methods.go', min: 80},
]

function toPosix(value) {
  return value.replaceAll('\\', '/').toLowerCase()
}

function canonicalPath(value) {
  const resolved = path.isAbsolute(value) ? value : path.resolve(repoRoot, value)
  return toPosix(path.normalize(resolved))
}

function loadText(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Coverage report not found: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

function addCoverage(map, filePath, covered, total) {
  const key = canonicalPath(filePath)
  const current = map.get(key) || {covered: 0, total: 0}
  current.covered += covered
  current.total += total
  map.set(key, current)
}

function parseGoCoverage(filePath) {
  const coverage = new Map()
  const lines = loadText(filePath).trim().split(/\r?\n/)

  for (const line of lines) {
    if (!line || line.startsWith('mode:')) {
      continue
    }

    const lastSpace = line.lastIndexOf(' ')
    const secondLastSpace = line.lastIndexOf(' ', lastSpace - 1)
    if (secondLastSpace === -1 || lastSpace === -1) {
      continue
    }

    const location = line.slice(0, secondLastSpace)
    const numStatements = Number(line.slice(secondLastSpace + 1, lastSpace))
    const hitCount = Number(line.slice(lastSpace + 1))
    const filePath = location.slice(0, location.lastIndexOf(':'))

    if (!Number.isFinite(numStatements) || !Number.isFinite(hitCount) || !filePath) {
      continue
    }

    addCoverage(coverage, filePath, hitCount > 0 ? numStatements : 0, numStatements)
  }

  return coverage
}

function parseLcov(filePath) {
  const coverage = new Map()
  const lines = loadText(filePath).split(/\r?\n/)
  let currentFile = ''
  let total = 0
  let covered = 0
  let summaryMode = false

  for (const line of lines) {
    if (line.startsWith('SF:')) {
      currentFile = line.slice(3).trim()
      total = 0
      covered = 0
      summaryMode = false
      continue
    }

    if (!currentFile) {
      continue
    }

    if (line.startsWith('LF:')) {
      total = Number(line.slice(3))
      summaryMode = true
      continue
    }

    if (line.startsWith('LH:')) {
      covered = Number(line.slice(3))
      summaryMode = true
      continue
    }

    if (!summaryMode && line.startsWith('DA:')) {
      const [, hitsText] = line.slice(3).split(',')
      const hits = Number(hitsText)
      total += 1
      if (hits > 0) {
        covered += 1
      }
      continue
    }

    if (line === 'end_of_record') {
      addCoverage(coverage, currentFile, covered, total)
      currentFile = ''
    }
  }

  if (currentFile) {
    addCoverage(coverage, currentFile, covered, total)
  }

  return coverage
}

function lookupCoverage(coverageMap, targetFile) {
  const targetKey = canonicalPath(targetFile)

  if (coverageMap.has(targetKey)) {
    return coverageMap.get(targetKey)
  }

  for (const [key, value] of coverageMap.entries()) {
    if (key.endsWith(targetKey) || targetKey.endsWith(key)) {
      return value
    }
  }

  return undefined
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}

const reports = [
  parseGoCoverage(path.join(repoRoot, 'server', 'coverage.out')),
  parseLcov(path.join(repoRoot, 'webapp', 'coverage', 'lcov.info')),
]

const mergedCoverage = new Map()
for (const report of reports) {
  for (const [key, value] of report.entries()) {
    const current = mergedCoverage.get(key) || {covered: 0, total: 0}
    current.covered += value.covered
    current.total += value.total
    mergedCoverage.set(key, current)
  }
}

const failures = []

for (const target of targets) {
  const coverage = lookupCoverage(mergedCoverage, target.file)

  if (!coverage || coverage.total === 0) {
    failures.push(`${target.label}: no coverage data found for ${target.file}`)
    continue
  }

  const percent = coverage.covered / coverage.total
  const status = percent >= target.min / 100 ? 'OK' : 'FAIL'
  console.log(`${status} ${target.label}: ${target.file} ${formatPercent(percent)} (min ${target.min}%)`)

  if (status === 'FAIL') {
    failures.push(`${target.label}: ${formatPercent(percent)} < ${target.min}% for ${target.file}`)
  }
}

if (failures.length > 0) {
  console.error('\nCoverage gate failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('\nCoverage gate passed.')
