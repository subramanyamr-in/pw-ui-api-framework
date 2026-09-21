import { logger } from '@utils';

export interface CleanupAction {
  entityType: string;
  identifier: string | number;
  cleanup: () => Promise<void> | void;
}

/**
 * TestDataRegistry tracks entities seeded or created during a test execution
 * and guarantees automatic, safe cleanup in LIFO (reverse) order during test teardown.
 *
 * WHY:
 * 1. Parallel workers creating records can collide or pollute database states.
 * 2. If a test assertion fails midway, raw teardown code at the end of the test never runs.
 * 3. Wiring TestDataRegistry into fixture use() ensures cleanup runs unconditionally,
 *    even when assertions fail!
 */
export class TestDataRegistry {
  private readonly actions: CleanupAction[] = [];

  /**
   * Registers an entity and its respective deletion or cleanup action.
   */
  register(
    entityType: string,
    identifier: string | number,
    cleanup: () => Promise<void> | void
  ): void {
    this.actions.push({ entityType, identifier, cleanup });
    logger.debug(
      `[TestDataRegistry] Registered "${entityType}" (${identifier}) for post-test cleanup.`
    );
  }

  /**
   * Executes all registered cleanup actions in LIFO order (last created is cleaned up first).
   * Catches errors individually so a failure cleaning one record does not abort remaining cleanups.
   */
  async cleanupAll(): Promise<void> {
    if (this.actions.length === 0) {
      return;
    }

    logger.debug(
      `[TestDataRegistry] Starting teardown of ${this.actions.length} registered item(s)...`
    );

    // Reverse order for foreign-key safety (child records before parents)
    const reversed = [...this.actions].reverse();

    for (const item of reversed) {
      try {
        await item.cleanup();
        logger.debug(
          `[TestDataRegistry] Successfully cleaned up "${item.entityType}" (${item.identifier}).`
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error(
          `[TestDataRegistry] Failed to clean up "${item.entityType}" (${item.identifier}): ${errorMsg}`
        );
      }
    }

    // Reset list
    this.actions.length = 0;
  }

  /**
   * Returns count of currently registered pending cleanups.
   */
  get count(): number {
    return this.actions.length;
  }
}
