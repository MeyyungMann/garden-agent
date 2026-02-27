import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { model } from "@/lib/ollama";
import { systemPrompt } from "./prompts/system";
import { tools } from "./tools";
import { createLogger } from "@/lib/logger";
import { getLocations } from "@/actions/locations";
import { getPlants } from "@/actions/plants";
import { getSeeds } from "@/actions/seeds";
import { getPlantings } from "@/actions/plantings";

const log = createLogger("ai:agent");

export async function buildDatabaseContext(): Promise<string> {
  try {
    const [locations, plants, seeds, plantings] = await Promise.all([
      getLocations(),
      getPlants(),
      getSeeds(),
      getPlantings(),
    ]);

    const lines: string[] = ["## Current Database State", "Use ONLY these real IDs when referencing existing items. NEVER invent IDs.", ""];

    // Locations
    lines.push(`### Garden Locations (${locations.length})`);
    if (locations.length === 0) {
      lines.push("No locations yet.");
    } else {
      for (const loc of locations) {
        lines.push(`- **${loc.name}** (ID: \`${loc.id}\`) — Type: ${loc.locationType}, Sun: ${loc.sunExposure ?? "N/A"}, Plantings: ${loc._count.plantings}`);
      }
    }
    lines.push("");

    // Plants
    lines.push(`### Plants (${plants.length})`);
    if (plants.length === 0) {
      lines.push("No plants yet.");
    } else {
      for (const p of plants) {
        const variety = p.variety ? ` (${p.variety})` : "";
        lines.push(`- **${p.name}${variety}** (ID: \`${p.id}\`) — Type: ${p.type}, Seeds: ${p._count.seeds}, Plantings: ${p._count.plantings}`);
      }
    }
    lines.push("");

    // Seeds
    lines.push(`### Seed Inventory (${seeds.length})`);
    if (seeds.length === 0) {
      lines.push("No seeds yet.");
    } else {
      for (const s of seeds) {
        const supplier = s.supplier ? ` from ${s.supplier}` : "";
        lines.push(`- **${s.plant.name}** seed (ID: \`${s.id}\`) — ${s.quantity} ${s.quantityUnit ?? "packets"}${supplier}, Viability: ${s.viability ?? "N/A"}%`);
      }
    }

    // Plantings (calendar)
    lines.push("");
    lines.push(`### Plantings / Calendar (${plantings.length})`);
    if (plantings.length === 0) {
      lines.push("No plantings scheduled yet.");
    } else {
      for (const p of plantings) {
        const loc = p.location ? ` at ${p.location.name}` : "";
        const dates: string[] = [];
        if (p.sowIndoorDate) dates.push(`Sow indoor: ${p.sowIndoorDate.toISOString().split("T")[0]}`);
        if (p.sowOutdoorDate) dates.push(`Sow outdoor: ${p.sowOutdoorDate.toISOString().split("T")[0]}`);
        if (p.transplantDate) dates.push(`Transplant: ${p.transplantDate.toISOString().split("T")[0]}`);
        if (p.harvestStart) dates.push(`Harvest: ${p.harvestStart.toISOString().split("T")[0]}`);
        const dateStr = dates.length > 0 ? ` | ${dates.join(", ")}` : "";
        lines.push(`- **${p.plant.name}**${loc} (ID: \`${p.id}\`) — Year: ${p.year}, Status: ${p.status}${dateStr}`);
      }
    }

    return lines.join("\n");
  } catch (error) {
    log.error("Failed to build database context", { error });
    return "";
  }
}

export async function runAgent(messages: UIMessage[], summary?: string) {
  log.info("Running agent", { messageCount: messages.length, hasSummary: !!summary });

  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    log.debug("Last message role", { role: lastMessage.role });
  }

  const [modelMessages, dbContext] = await Promise.all([
    convertToModelMessages(messages),
    buildDatabaseContext(),
  ]);

  // Build the system prompt with database context and optional conversation summary
  let fullSystemPrompt = systemPrompt;

  if (dbContext) {
    fullSystemPrompt += `\n\n${dbContext}`;
  }

  if (summary) {
    fullSystemPrompt += `\n\n## Previous Conversation Context\nThe following is a summary of the earlier part of this conversation:\n\n${summary}\n\nUse this context to maintain continuity, but prioritize the recent messages for the current request.`;
  }

  const result = streamText({
    model,
    system: fullSystemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
    onStepFinish({ text, toolCalls, toolResults, finishReason }) {
      log.debug("Step finished", {
        finishReason,
        hasText: !!text,
        toolCallCount: toolCalls?.length ?? 0,
        toolResultCount: toolResults?.length ?? 0,
      });
    },
  });

  log.info("Agent stream created");
  return result;
}
