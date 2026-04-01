namespace MegaSimulator.Application.DTOs
{
    public class SavingsRequestDto
    {
        /// <summary>Montant cible nominal (€)</summary>
        public decimal ObjectiveEuros { get; set; }

        /// <summary>Horizon en mois</summary>
        public int HorizonMonths { get; set; } = 24;

        /// <summary>Inflation annuelle en fraction (ex. 0.018) ; null = paramètre fichier</summary>
        public decimal? InflationAnnual { get; set; }

        /// <summary>Rendement nominal annuel en fraction (ex. 0.015 pour Livret A) ; null = paramètre fichier</summary>
        public decimal? NominalYieldAnnual { get; set; }

        /// <summary>Capital déjà disponible placé dès le départ (€)</summary>
        public decimal InitialSavingsEuros { get; set; }

        /// <summary>Versements déjà prévus par mois aujourd’hui (€)</summary>
        public decimal CurrentMonthlySavingsEuros { get; set; }

        /// <summary>Revenu net annuel (€) — optionnel, pour budget vêtements indicatif</summary>
        public decimal? AnnualNetIncomeEuros { get; set; }

        public bool SwitchNavigoToBike { get; set; }
        public bool SwitchTelecomOptimize { get; set; }
        public bool SwitchMealPrep { get; set; }
        public bool SwitchSubscriptionsBundle { get; set; }
    }
}
