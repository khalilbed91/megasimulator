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
    }

    public class Smic { public double hourly_brut { get; set; } public double monthly_brut_35h { get; set; } }
    public class Pmss { public double monthly { get; set; } public double annual { get; set; } }
    public class CsgCrds { public double assiette_pct { get; set; } public double csg_deductible_pct { get; set; } public double csg_non_deductible_pct { get; set; } }
    public class AgircArrco { public double tranche1_pct { get; set; } public double tranche2_pct { get; set; } public double valeur_point { get; set; } }
}
