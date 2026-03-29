namespace MegaSimulator.Application.DTOs
{
    public class PayrollResponseDto
    {
        public decimal Net { get; set; }
        public decimal EmployerCost { get; set; }
        public decimal SocialContribution { get; set; }
        public decimal CsgBase { get; set; }
        public decimal CsgDeductible { get; set; }
        public decimal CsgNonDeductible { get; set; }
        public decimal AgircArrco { get; set; }
        public bool IsJeiEligible { get; set; }
        // Optional fields for frontend display
        public decimal RetenuePct { get; set; }
        public decimal RetenueAmount { get; set; }
        public decimal NetAfterRetenue { get; set; }
        public decimal NetMonthly { get; set; }
    }
}
