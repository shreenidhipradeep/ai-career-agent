export function guessDomain(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com"
}
