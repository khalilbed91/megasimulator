namespace MegaSimulator.Application.DTOs
{
    public class PayrollRequestDto
    {
        public decimal Brut { get; set; }
        public string Statut { get; set; } = "non-cadre";
    }
}
