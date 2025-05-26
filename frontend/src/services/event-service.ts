export function isSlotClosed(slot: any, closedSlots: any[]) {
  if (!slot) return false;

  const slotStart = new Date(slot.startStr || slot.dateStr);
  const slotEnd = slot.endStr ? new Date(slot.endStr) : slotStart;

  return closedSlots.some((closed) => {
    const closedStart = new Date(closed.start);
    const closedEnd = closed.end ? new Date(closed.end) : closedStart;

    // Check if slot overlaps closed slot
    return slotStart < closedEnd && slotEnd > closedStart;
  });
}
