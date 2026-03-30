namespace MegaSimulator.Application.DTOs
{
    public class RetirementRequestDto
    {
        public int AnneeNaissance { get; set; }
        public int AgeDepart { get; set; } = 64;
        public decimal SalaireAnnuelMoyen { get; set; }
        public int TrimestresValides { get; set; }
        public int TrimestresRequis { get; set; } = 170;
        public decimal PointsComplementaires { get; set; }
        public string Regime { get; set; } = "general";
        public decimal RevenusAnnuelsActuels { get; set; }

        /// <summary>Optional target net monthly pension — API returns estimated extra quarters/years to reach it (simplified model).</summary>
        public decimal? ObjectifPensionMensuelleNet { get; set; }
    }
}
