#!/usr/bin/env node
/**
 * Script to import a simulation JSON file into the database
 * 
 * Usage:
 *   node import-simulation.js <path-to-json-file>
 *   OR
 *   node import-simulation.js project-management-simulation.json
 * 
 * Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE 
 * environment variables set (from .env.local)
 */

const { createClient } = require("@supabase/supabase-js");
const { readFileSync } = require("fs");
const { join } = require("path");

// Load environment variables from .env.local if it exists
try {
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    });
  }
} catch (error) {
  // Ignore if .env.local doesn't exist or can't be read
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE;

if (!URL) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
  console.error("   Please set it in .env.local or export it in your shell");
  process.exit(1);
}

if (!SERVICE) {
  console.error("Error: SUPABASE_SERVICE_ROLE environment variable is not set");
  console.error("   Please set it in .env.local or export it in your shell");
  process.exit(1);
}

const supabase = createClient(URL, SERVICE, {
  auth: { persistSession: false },
});

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}

async function importSimulation(jsonPath) {
  try {
    // Read and parse the JSON file
    const filePath = join(process.cwd(), jsonPath);
    console.log(`Reading simulation file: ${filePath}`);
    const fileContent = readFileSync(filePath, "utf-8");
    const simulation = JSON.parse(fileContent);

    // Generate slug
    const slug = slugify(simulation.slug_suggestion || simulation.title);

    console.log(`\nImporting simulation:`);
    console.log(`  Title: ${simulation.title}`);
    console.log(`  Slug: ${slug}`);
    console.log(`  Steps: ${simulation.steps.length}`);
    console.log(`  Rubric items: ${simulation.rubric.length}`);

    // Check if simulation with this slug already exists
    const { data: existing, error: checkError } = await supabase
      .from("simulations")
      .select("slug, title")
      .eq("slug", slug)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" which is fine
      console.error(`\n⚠️  Error checking for existing simulation:`, checkError.message);
      process.exit(1);
    }

    if (existing) {
      console.log(`\n⚠️  Warning: Simulation with slug "${slug}" already exists.`);
      console.log(`   Existing title: ${existing.title}`);
      console.log(`   To update it, use: PUT /api/attempt/admin/simulations/${slug}`);
      console.log(`\n   This script does not support updates. Exiting.`);
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
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    if (error.code === "ENOENT") {
      console.error(`   File not found: ${jsonPath}`);
      console.error(`   Make sure the file path is correct.`);
    }
    process.exit(1);
  }
}

// Main execution
const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error("Usage: node import-simulation.js <path-to-json-file>");
  console.error("Example: node import-simulation.js project-management-simulation.json");
  process.exit(1);
}

importSimulation(jsonPath);

