import { describe, it, expect } from "vitest";
import {
  createSession,
  getLatestSession,
  saveMessage,
  getSessionContext,
} from "@/actions/chat";
import { testDb } from "@/test/setup-integration";

describe("chat actions", () => {
  describe("createSession", () => {
    it("creates a session with default title", async () => {
      const session = await createSession();
      expect(session.title).toBe("New Chat");
      expect(session.id).toBeDefined();
    });

    it("creates a session with custom title", async () => {
      const session = await createSession("My Garden Chat");
      expect(session.title).toBe("My Garden Chat");
    });
  });

  describe("saveMessage", () => {
    it("saves a message to a session", async () => {
      const session = await createSession();
      const msg = await saveMessage(session.id, {
        role: "user",
        content: "What plants should I grow?",
      });
      expect(msg.role).toBe("user");
      expect(msg.content).toBe("What plants should I grow?");
      expect(msg.sessionId).toBe(session.id);
    });

    it("updates session updatedAt", async () => {
      const session = await createSession();
      const before = session.updatedAt;
      // Small delay to ensure different timestamp
      await new Promise((r) => setTimeout(r, 50));
      await saveMessage(session.id, { role: "user", content: "Hello" });
      const updated = await testDb.chatSession.findUnique({ where: { id: session.id } });
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("getLatestSession", () => {
    it("returns null when no sessions have messages", async () => {
      await createSession(); // empty session
      const latest = await getLatestSession();
      expect(latest).toBeNull();
    });

    it("returns the most recently updated session with messages", async () => {
      const s1 = await createSession();
      await saveMessage(s1.id, { role: "user", content: "Hello" });
      await new Promise((r) => setTimeout(r, 50));
      const s2 = await createSession();
      await saveMessage(s2.id, { role: "user", content: "World" });

      const latest = await getLatestSession();
      expect(latest!.id).toBe(s2.id);
      expect(latest!.messages.length).toBe(1);
    });
  });

  describe("getSessionContext", () => {
    it("returns all messages when below threshold", async () => {
      const session = await createSession();
      await saveMessage(session.id, { role: "user", content: "Hello" });
      await saveMessage(session.id, { role: "assistant", content: "Hi there!" });

      const context = await getSessionContext(session.id);
      expect(context.recentMessages.length).toBe(2);
      expect(context.needsSummarization).toBe(false);
    });

    it("throws for non-existent session", async () => {
      await expect(getSessionContext("non-existent")).rejects.toThrow("Session not found");
    });
  });
});
