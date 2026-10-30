/**
 * Triggers the browser's native print dialog formatted for the layout.
 */
export function triggerDirectPrint(): void {
  // Briefly ensure layout is settled then call window.print()
  setTimeout(() => {
    window.print();
  }, 100);
}
