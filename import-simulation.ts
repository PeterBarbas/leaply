#!/usr/bin/env node
/**
 * Script to import a simulation JSON file into the database
 * 
 * Usage:
 *   npx tsx import-simulation.ts <path-to-json-file>
 *   OR
 *   npx tsx import-simulation.ts project-management-simulation.json
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables (assuming .env.local exists)
import { config } from "dotenv";
config({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE;

if (!URL) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
  process.exit(1);
}

if (!SERVICE) {
  console.error("Error: SUPABASE_SERVICE_ROLE environment variable is not set");
  process.exit(1);
}

const supabase = createClient(URL, SERVICE, {
  auth: { persistSession: false },
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}

interface SimulationJson {
  title: string;
  slug_suggestion?: string;
  rubric: string[];
  steps: any[];
}

async function importSimulation(jsonPath: string) {
  try {
    // Read and parse the JSON file
    const filePath = join(process.cwd(), jsonPath);
    console.log(`Reading simulation file: ${filePath}`);
    const fileContent = readFileSync(filePath, "utf-8");
    const simulation: SimulationJson = JSON.parse(fileContent);

    // Generate slug
    const slug = slugify(simulation.slug_suggestion || simulation.title);

    console.log(`\nImporting simulation:`);
    console.log(`  Title: ${simulation.title}`);
    console.log(`  Slug: ${slug}`);
    console.log(`  Steps: ${simulation.steps.length}`);
    console.log(`  Rubric items: ${simulation.rubric.length}`);

    // Check if simulation with this slug already exists
    const { data: existing } = await supabase
      .from("simulations")
      .select("slug, title")
      .eq("slug", slug)
      .single();

    if (existing) {
      console.log(`\n⚠️  Warning: Simulation with slug "${slug}" already exists.`);
      console.log(`   Existing title: ${existing.title}`);
      console.log(`   Use PUT /api/attempt/admin/simulations/[slug] to update it.`);
      console.log(`\nWould you like to update it instead? (This script does not support updates yet)`);
      process.exit(1);
    }

    // Insert the simulation
    const { data, error } = await supabase
      .from("simulations")
      .insert({
        slug,
        title: simulation.title,
        steps: simulation.steps,
        rubric: simulation.rubric,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error(`\n❌ Error inserting simulation:`, error.message);
      console.error(`   Details:`, error);
      process.exit(1);
    }

    console.log(`\n✅ Successfully imported simulation!`);
    console.log(`   ID: ${data.id}`);
    console.log(`   Slug: ${data.slug}`);
    console.log(`   Title: ${data.title}`);
    console.log(`\nYou can now access this simulation at: /s/${slug}`);
  } catch (error: any) {
    console.error(`\n❌ Error:`, error.message);
    if (error.code === "ENOENT") {
      console.error(`   File not found: ${jsonPath}`);
    }
    process.exit(1);
  }
}

// Main execution
const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error("Usage: npx tsx import-simulation.ts <path-to-json-file>");
  console.error("Example: npx tsx import-simulation.ts project-management-simulation.json");
  process.exit(1);
}

importSimulation(jsonPath);

