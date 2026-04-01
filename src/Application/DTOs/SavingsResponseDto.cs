using System.Collections.Generic;

namespace MegaSimulator.Application.DTOs
{
    public class SavingsSwitchLineDto
    {
        public string Id { get; set; } = "";
        public string LabelFr { get; set; } = "";
        public string LabelEn { get; set; } = "";
        public decimal MonthlyGainEuros { get; set; }
        public bool Selected { get; set; }
    }

    public class SavingsResponseDto
    {
        public decimal IndexedObjectiveEuros { get; set; }
        public decimal NominalObjectiveEuros { get; set; }
        public decimal InflationAnnualUsed { get; set; }
        public decimal NominalYieldAnnualUsed { get; set; }
        public int HorizonMonths { get; set; }
        public decimal InitialSavingsEuros { get; set; }
        public decimal RequiredMonthlyEuros { get; set; }
        public decimal CurrentMonthlySavingsEuros { get; set; }
        public decimal GapEuros { get; set; }
        public List<SavingsSwitchLineDto> Switches { get; set; } = new();
        public decimal TotalSelectedSwitchGainEuros { get; set; }
        public decimal GapAfterSwitchesEuros { get; set; }
        public decimal DailyEquivalentEuros { get; set; }
        public decimal? ClothingBudgetMonthlyEuros { get; set; }
        public List<string> Warnings { get; set; } = new();
        public string? ParamsSourceNote { get; set; }
    }
}
