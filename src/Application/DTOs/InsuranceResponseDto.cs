using System.Collections.Generic;

namespace MegaSimulator.Application.DTOs
{
    public class InsuranceBreakdownLineDto
    {
        public string Label { get; set; } = "";
        public decimal Amount { get; set; }
    }

    public class InsuranceResponseDto
    {
        public decimal AnnualPremium { get; set; }
        public decimal MonthlyPremium { get; set; }
        public decimal LegalMinimumAnnualPremium { get; set; }
        public decimal CoverageAddonsAnnualPremium { get; set; }
        public decimal RiskAdjustmentAmount { get; set; }
        public decimal DeductibleDiscountAmount { get; set; }
        public decimal CrmUsed { get; set; }
        public bool IsMandatoryInsurance { get; set; }
        public string MandatoryCoverageLabel { get; set; } = "";
        public string Product { get; set; } = "";
        public string CoverageLevel { get; set; } = "";
        public string DeductibleLevel { get; set; } = "";
        public List<InsuranceBreakdownLineDto> Breakdown { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public List<string> Assumptions { get; set; } = new();
        public string ParamsSourceNote { get; set; } = "Hypothèses pédagogiques MegaSimulator 2026 ; tarifs non contractuels.";
    }
}
