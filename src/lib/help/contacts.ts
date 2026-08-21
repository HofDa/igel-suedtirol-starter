import 'server-only';

export type HelpContact = {
  name: string;
  area?: string;
  phone?: string;
  email?: string;
  website?: string;
  editoriallyApproved: true;
};

/**
 * Kontakte werden ausschließlich aus redaktionell gepflegter Konfiguration
 * geladen. Ungültige oder nicht ausdrücklich freigegebene Einträge werden
 * vollständig verworfen; es gibt keine eingebauten Telefonnummern.
 */
export function loadApprovedHelpContacts(): HelpContact[] {
  const raw = process.env.HELP_CONTACTS_JSON;
  if (!raw) return [];
  try {
    const values = JSON.parse(raw) as unknown;
    if (!Array.isArray(values)) return [];
    return values.filter((value): value is HelpContact => {
      if (!value || typeof value !== 'object') return false;
      const contact = value as Record<string, unknown>;
      return (
        contact.editoriallyApproved === true &&
        typeof contact.name === 'string' &&
        [contact.phone, contact.email, contact.website].some((entry) => typeof entry === 'string' && entry.length > 0)
      );
    });
  } catch {
    return [];
  }
}
