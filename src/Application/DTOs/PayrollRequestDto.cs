namespace MegaSimulator.Application.DTOs
{
    public class PayrollRequestDto
    {
        public decimal Brut { get; set; }
        public string Statut { get; set; } = "non-cadre";
        public decimal BrutAnnuel { get; set; }
        public int Parts { get; set; } = 1;
        public decimal RevenusAnnexes { get; set; }
        public decimal Primes { get; set; }
        public decimal RetenuePct { get; set; }
    }
}
