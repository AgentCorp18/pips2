#!/usr/bin/env npx tsx
/**
 * Content Seeder — Upserts content-nodes.json into Supabase
 *
 * Usage: npx tsx scripts/seed-content.ts
 *
 * Reads: scripts/output/content-nodes.json
 * Writes: Supabase content_nodes table (upsert by id)
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

type ContentNode = {
  id: string
  pillar: string
  title: string
  slug: string
  parentId: string | null
  tags: Record<string, unknown>
  summary: string
  bodyMd: string | null
  estimatedReadMinutes: number
  sourceFile: string
  sortOrder: number
  accessLevel: string
  relatedNodes: string[]
}

const main = async () => {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
    console.error('Set them in .env.local or pass them directly')
    process.exit(1)
  }

  const inputPath = path.resolve(__dirname, 'output/content-nodes.json')
  if (!fs.existsSync(inputPath)) {
    console.error(`Content nodes not found: ${inputPath}`)
    console.error('Run "npx tsx scripts/compile-content.ts" first')
    process.exit(1)
  }

  const nodes: ContentNode[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  console.log(`Loaded ${nodes.length} content nodes from ${inputPath}`)

  // Upsert in batches of 50
  const batchSize = 50
  let upserted = 0

  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize)
    const rows = batch.map((n) => ({
      id: n.id,
      pillar: n.pillar,
      title: n.title,
      slug: n.slug,
      parent_id: n.parentId,
      summary: n.summary,
      body_md: n.bodyMd,
      estimated_read_minutes: n.estimatedReadMinutes,
      source_file: n.sourceFile,
      sort_order: n.sortOrder,
      access_level: n.accessLevel,
      tags: n.tags,
      related_nodes: n.relatedNodes,
    }))

    // Use Supabase REST API directly to avoid import issues
    const response = await fetch(`${supabaseUrl}/rest/v1/content_nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(rows),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Failed to upsert batch ${i / batchSize + 1}: ${response.status}`)
      console.error(error)
      process.exit(1)
    }

    upserted += batch.length
    console.log(`  Upserted ${upserted}/${nodes.length}`)
  }

  console.log(`\nDone: ${upserted} content nodes seeded to Supabase`)
}

main().catch(console.error)
