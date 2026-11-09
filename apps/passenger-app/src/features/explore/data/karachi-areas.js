// Informational names only, not Saheli routes, stops or service availability.
// Names checked against Government of Sindh locality/town listings:
// https://click.gos.pk/karachiuc and https://sbca.gos.pk/Head-Quarter
export const KARACHI_AREAS = Object.freeze([
  "Gulshan-e-Iqbal", "Clifton", "Saddar", "North Nazimabad", "Malir", "Gulberg",
]);
export function filterKarachiAreas(query) {
  const normalized = typeof query === "string" ? query.trim().toLocaleLowerCase("en") : "";
  return KARACHI_AREAS.filter(name => name.toLocaleLowerCase("en").includes(normalized));
}
