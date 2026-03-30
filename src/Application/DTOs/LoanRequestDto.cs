namespace MegaSimulator.Application.DTOs
{
    /// <summary>perso | auto | immo</summary>
    public class LoanRequestDto
    {
        public string Category { get; set; } = "immo";

        /// <summary>ancien | neuf20 | neuf10 | neuf55 — immobilier, frais de notaire et mention TVA</summary>
        public string? TvaRegime { get; set; }

        /// <summary>Prix TTC affaire (immo) ou ignoré si Amount utilisé pour perso/auto</summary>
        public decimal PurchasePriceTtc { get; set; }

        /// <summary>Principal direct pour perso / auto (€). Si &gt; 0 et catégorie non immo, utilisé à la place du prix.</summary>
        public decimal Amount { get; set; }

        /// <summary>Optionnel neuf : prix HT — le TTC est recalculé avec la TVA du régime</summary>
        public decimal? PriceHt { get; set; }

        public decimal DownPayment { get; set; }

        /// <summary>Taux nominal annuel en % (ex : 3,45 pour 3,45 %)</summary>
        public decimal NominalRateAnnualPercent { get; set; }

        public int DurationMonths { get; set; } = 240;

        /// <summary>Assurance emprunteur annuelle en % du capital initial (ex : 0,20)</summary>
        public decimal InsuranceAnnualPercent { get; set; } = 0.20m;

        public decimal FileFees { get; set; }
        public decimal GuaranteeFees { get; set; }

        public decimal OtherMonthlyCredits { get; set; }
        public decimal NetMonthlyIncome { get; set; }

        public bool IncludePtz { get; set; }

        /// <summary>AbisA | B1 | B2 | C</summary>
        public string? PtzZone { get; set; }

        public int HouseholdPersons { get; set; } = 1;

        /// <summary>Revenu fiscal de référence (N-2) pour contrôle plafond PT €</summary>
        public decimal FiscalReferenceIncome { get; set; }

        public decimal PtzAmount { get; set; }
        public int PtzDefermentMonths { get; set; } = 120;

        public bool IncludeActionLogement { get; set; }
        public decimal ActionLogementAmount { get; set; }
        public decimal ActionLogementRateAnnualPercent { get; set; } = 1.0m;
    }
}
