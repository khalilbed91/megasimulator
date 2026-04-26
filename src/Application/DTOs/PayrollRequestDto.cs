namespace MegaSimulator.Application.DTOs
{
    public class PayrollRequestDto
    {
        public decimal Brut { get; set; }
        public string Statut { get; set; } = "non-cadre";
        public decimal BrutAnnuel { get; set; }
        public decimal Parts { get; set; } = 1m;
        public decimal RevenusAnnexes { get; set; }
        public decimal Primes { get; set; }
        /// <summary>Prise en charge employeur transports (€/mois) — intègre la base brute pour cotisations.</summary>
        public decimal TransportMensuel { get; set; }
        /// <summary>Forfait télétravail (€/mois) — intègre la base brute.</summary>
        public decimal TeletravailMensuel { get; set; }
        /// <summary>Valeur faciale mensuelle des titres-restaurant (€).</summary>
        public decimal TicketRestoMensuel { get; set; }
        /// <summary>Part employeur des titres-restaurant, 0–100 (%). La part salariale est déduite du net.</summary>
        public decimal TicketRestoEmployeurPct { get; set; }
        /// <summary>Cotisation mutuelle (part salariale) à déduire du net après impôt (€/mois).</summary>
        public decimal MutuelleNetDeduction { get; set; }
        public decimal RetenuePct { get; set; }
        /// <summary>Persist the simulation in history. Auto-refresh calls can disable this.</summary>
        public bool Persist { get; set; } = true;
    }
}
