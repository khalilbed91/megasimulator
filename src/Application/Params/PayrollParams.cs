using System.Text.Json.Serialization;

namespace MegaSimulator.Application.Params
{
    public class PayrollParams
    {
        [JsonPropertyName("smic")]
        public Smic? Smic { get; set; }

        [JsonPropertyName("pmss")]
        public Pmss? Pmss { get; set; }

        [JsonPropertyName("csg_crds")]
        public CsgCrds? CsgCrds { get; set; }

        [JsonPropertyName("agirc_arrco")]
        public AgircArrco? AgircArrco { get; set; }

        [JsonPropertyName("jei")]
        public Jei? Jei { get; set; }

        [JsonPropertyName("savings")]
        public SavingsParams? Savings { get; set; }
    }

    public class SavingsParams
    {
        [JsonPropertyName("inflation_estimate")]
        public double InflationEstimate { get; set; } = 0.018;

        [JsonPropertyName("livret_a_nominal_annual")]
        public double LivretANominalAnnual { get; set; } = 0.015;

        [JsonPropertyName("lep_nominal_annual")]
        public double LepNominalAnnual { get; set; } = 0.025;

        [JsonPropertyName("source_note")]
        public string? SourceNote { get; set; }

        [JsonPropertyName("switch_presets_eur_monthly")]
        public SwitchPresetsEurMonthly? SwitchPresetsEurMonthly { get; set; }

        [JsonPropertyName("clothing_pct_of_annual_net")]
        public double ClothingPctOfAnnualNet { get; set; } = 0.05;
    }

    public class SwitchPresetsEurMonthly
    {
        [JsonPropertyName("navigo_to_bike")]
        public double NavigoToBike { get; set; } = 60;

        [JsonPropertyName("telecom_optimize")]
        public double TelecomOptimize { get; set; } = 30;

        [JsonPropertyName("meal_prep")]
        public double MealPrep { get; set; } = 200;

        [JsonPropertyName("subscriptions_bundle")]
        public double SubscriptionsBundle { get; set; } = 25;
    }

    public class Smic { public double hourly_brut { get; set; } public double monthly_brut_35h { get; set; } }
    public class Pmss { public double monthly { get; set; } public double annual { get; set; } }
    public class CsgCrds { public double assiette_pct { get; set; } public double csg_deductible_pct { get; set; } public double csg_non_deductible_pct { get; set; } }
    public class AgircArrco { public double tranche1_pct { get; set; } public double tranche2_pct { get; set; } public double valeur_point { get; set; } }

    public class Jei { public int pmss_multiple_for_plafond { get; set; } public double jei_plafond_manual { get; set; } }
}
