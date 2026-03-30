using System.Collections.Generic;

namespace MegaSimulator.Application.DTOs
{
    public class LoanScheduleRowDto
    {
        public int Month { get; set; }
        public decimal PrincipalPart { get; set; }
        public decimal InterestPart { get; set; }
        public decimal InsurancePart { get; set; }
        public decimal Payment { get; set; }
        public decimal RemainingPrincipal { get; set; }
    }

    public class LoanResponseDto
    {
        public string Category { get; set; } = string.Empty;
        public string? TvaRegime { get; set; }
        public decimal TvaRateAppliedPercent { get; set; }
        public decimal EffectivePurchaseTtc { get; set; }
        public decimal NotaryFees { get; set; }
        public decimal NotaryFeesPercent { get; set; }
        public decimal TotalProjectBeforeBank { get; set; }
        public decimal BankPrincipal { get; set; }
        public decimal PtzAmountApplied { get; set; }
        public decimal ActionLogementAmountApplied { get; set; }

        public decimal MonthlyBankPrincipalInterest { get; set; }
        public decimal MonthlyInsurance { get; set; }
        public decimal MonthlyActionLogement { get; set; }
        public decimal MonthlyPtz { get; set; }
        public decimal MonthlyTotalSteadyState { get; set; }

        public int PtzDefermentMonths { get; set; }
        public bool PtzIncomeEligible { get; set; }
        public decimal PtzIncomeCapReference { get; set; }
        public decimal PtzAmountCapReference { get; set; }

        public decimal DebtRatio { get; set; }
        public bool HcsfDebtRatioOk { get; set; }
        public bool HcsfResteAVivreOk { get; set; }
        public decimal ResteAVivre { get; set; }
        public decimal TaegApproximatePercent { get; set; }
        public decimal UsuryThresholdPercent { get; set; }
        public bool UsuryOk { get; set; }

        public decimal TotalInterestBank { get; set; }
        public decimal TotalInsurance { get; set; }
        public decimal TotalCostOfCredit { get; set; }

        public List<string> Warnings { get; set; } = new();
        public List<LoanScheduleRowDto> SchedulePreview { get; set; } = new();
    }
}
