namespace MegaSimulator.Application.DTOs
{
    public class RetirementResponseDto
    {
        public decimal PensionBaseAnnuelle { get; set; }
        public decimal PensionComplementaireAnnuelle { get; set; }
        public decimal PensionBruteTotaleAnnuelle { get; set; }
        public decimal PensionNetteAnnuelle { get; set; }
        public decimal PensionNetteMensuelle { get; set; }
        public decimal TauxRemplacement { get; set; }
        public int TrimestresValides { get; set; }
        public int TrimestresRequis { get; set; }
        public int TrimestresManquants { get; set; }
        public decimal DecotePct { get; set; }
        public decimal SurcotePct { get; set; }
        public decimal Sam { get; set; }
        public decimal ValeurPoint { get; set; }

        /// <summary>Echo of requested retirement age (informational; simplified model does not vary pension by age).</summary>
        public int AgeDepart { get; set; }

        /// <summary>Birth year + retirement age — projected calendar year of retirement.</summary>
        public int AnneeDepartRetraite { get; set; }

        /// <summary>Simplified legal/pivot age for the generation (does not include all 2023 reform nuances).</summary>
        public int AgeLegalPivot { get; set; }

        /// <summary>Net monthly pension if all required quarters were validated (same SAM & points), no décote, no surcote.</summary>
        public decimal PensionNetteMensuelleTauxPleinTrimestres { get; set; }

        public decimal PensionNetteAnnuelleTauxPleinTrimestres { get; set; }

        /// <summary>Extra net €/month vs current scenario when &lt; taux plein; negative if current already above reference.</summary>
        public decimal PotentielMensuelVersTauxPlein { get; set; }

        /// <summary>Missing quarters ÷ 4, rounded up — indicative years of work at ~4 quarters/year.</summary>
        public int AnneesIndicativesPourTauxPlein { get; set; }

        public int? TrimestresAdditionnelsPourObjectif { get; set; }

        public int? AnneesIndicativesPourObjectif { get; set; }

        public bool ObjectifAtteignable { get; set; }
    }
}
