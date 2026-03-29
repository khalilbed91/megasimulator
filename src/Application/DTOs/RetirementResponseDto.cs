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
    }
}
