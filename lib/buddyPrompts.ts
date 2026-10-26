/** Local visit budget. Navigation gets fresh help; a paused/dismissed cue never consumes it. */
export class BuddyPromptBudget {
  private path = "";
  count = 0;
  enter(path: string) {
    if (path !== this.path) { this.path = path; this.count = 0; }
  }
  claim(path: string, state: { open: boolean; visible: boolean; editing: boolean; hasCue: boolean; mutedUntil: number; now: number }) {
    this.enter(path);
    if (state.open || !state.visible || state.editing || state.hasCue || state.now < state.mutedUntil || this.count >= 2) return false;
    this.count++;
    return true;
  }
}
